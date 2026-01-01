from fastapi import FastAPI, APIRouter, HTTPException, Depends, Response, Request
from fastapi.security import HTTPBearer
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'denticompare-secret-key-2024')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_DAYS = 7

# Create the main app
app = FastAPI(title="DentiCompare API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

security = HTTPBearer(auto_error=False)

# ==================== MODELS ====================

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    created_at: datetime

class Treatment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    treatment_id: str
    name: str
    description: str
    category: str
    icon: str

class Clinic(BaseModel):
    model_config = ConfigDict(extra="ignore")
    clinic_id: str
    name: str
    description: str
    address: str
    city: str
    postal_code: str
    latitude: float
    longitude: float
    phone: str
    email: str
    image_url: str
    rating: float
    review_count: int
    created_at: datetime

class ClinicTreatment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    clinic_id: str
    treatment_id: str
    price: float
    duration_days: int
    warranty_months: int
    process_steps: List[str]
    includes: List[str]

class ClinicWithTreatments(Clinic):
    treatments: List[dict] = []

class CompareRequest(BaseModel):
    clinic_ids: List[str]
    treatment_id: str

class SearchFilters(BaseModel):
    city: Optional[str] = None
    treatment_id: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    min_rating: Optional[float] = None

# ==================== AUTH HELPERS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_jwt_token(user_id: str) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRATION_DAYS),
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_jwt_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")

async def get_current_user(request: Request) -> User:
    # Check cookie first
    session_token = request.cookies.get("session_token")
    
    # Then check Authorization header
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if not session_token:
        raise HTTPException(status_code=401, detail="No autenticado")
    
    # Check if it's a JWT token (for email/password auth)
    try:
        payload = decode_jwt_token(session_token)
        user_doc = await db.users.find_one(
            {"user_id": payload["user_id"]},
            {"_id": 0}
        )
        if user_doc:
            return User(**user_doc)
    except:
        pass
    
    # Check if it's a session token (for Google auth)
    session_doc = await db.user_sessions.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    
    if not session_doc:
        raise HTTPException(status_code=401, detail="Sesión no encontrada")
    
    # Check expiration
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Sesión expirada")
    
    user_doc = await db.users.find_one(
        {"user_id": session_doc["user_id"]},
        {"_id": 0}
    )
    
    if not user_doc:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    
    return User(**user_doc)

# ==================== AUTH ENDPOINTS ====================

@api_router.post("/auth/register")
async def register(user_data: UserCreate, response: Response):
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    hashed_pw = hash_password(user_data.password)
    
    user_doc = {
        "user_id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "password": hashed_pw,
        "picture": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    token = create_jwt_token(user_id)
    
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=JWT_EXPIRATION_DAYS * 24 * 60 * 60
    )
    
    return {
        "user_id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "token": token
    }

@api_router.post("/auth/login")
async def login(credentials: UserLogin, response: Response):
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    
    if not user_doc:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    
    if "password" not in user_doc or not verify_password(credentials.password, user_doc["password"]):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    
    token = create_jwt_token(user_doc["user_id"])
    
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=JWT_EXPIRATION_DAYS * 24 * 60 * 60
    )
    
    return {
        "user_id": user_doc["user_id"],
        "email": user_doc["email"],
        "name": user_doc["name"],
        "picture": user_doc.get("picture"),
        "token": token
    }

@api_router.post("/auth/session")
async def process_session(request: Request, response: Response):
    """Process Google OAuth session_id and create local session"""
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id requerido")
    
    # Call Emergent auth to get user data
    async with httpx.AsyncClient() as client_http:
        resp = await client_http.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
        
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Sesión inválida")
        
        user_data = resp.json()
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data["email"]}, {"_id": 0})
    
    if existing_user:
        user_id = existing_user["user_id"]
        # Update user data
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {
                "name": user_data["name"],
                "picture": user_data.get("picture")
            }}
        )
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id,
            "email": user_data["email"],
            "name": user_data["name"],
            "picture": user_data.get("picture"),
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    
    # Create session
    session_token = user_data.get("session_token", f"session_{uuid.uuid4().hex}")
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    
    return {
        "user_id": user_id,
        "email": user_data["email"],
        "name": user_data["name"],
        "picture": user_data.get("picture")
    }

@api_router.get("/auth/me")
async def get_me(user: User = Depends(get_current_user)):
    return {
        "user_id": user.user_id,
        "email": user.email,
        "name": user.name,
        "picture": user.picture
    }

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get("session_token")
    
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/", samesite="none", secure=True)
    
    return {"message": "Sesión cerrada correctamente"}

# ==================== TREATMENTS ENDPOINTS ====================

@api_router.get("/treatments", response_model=List[Treatment])
async def get_treatments():
    treatments = await db.treatments.find({}, {"_id": 0}).to_list(100)
    return treatments

@api_router.get("/treatments/{treatment_id}", response_model=Treatment)
async def get_treatment(treatment_id: str):
    treatment = await db.treatments.find_one({"treatment_id": treatment_id}, {"_id": 0})
    if not treatment:
        raise HTTPException(status_code=404, detail="Tratamiento no encontrado")
    return treatment

# ==================== CLINICS ENDPOINTS ====================

@api_router.get("/clinics")
async def get_clinics(
    city: Optional[str] = None,
    treatment_id: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_rating: Optional[float] = None
):
    # Build query
    query = {}
    if city:
        query["city"] = {"$regex": city, "$options": "i"}
    if min_rating:
        query["rating"] = {"$gte": min_rating}
    
    clinics = await db.clinics.find(query, {"_id": 0}).to_list(100)
    
    # If treatment filter, get clinics that offer it
    if treatment_id:
        clinic_treatments = await db.clinic_treatments.find(
            {"treatment_id": treatment_id},
            {"_id": 0}
        ).to_list(1000)
        
        clinic_ids_with_treatment = {ct["clinic_id"] for ct in clinic_treatments}
        clinics = [c for c in clinics if c["clinic_id"] in clinic_ids_with_treatment]
        
        # Add treatment info to each clinic
        treatment_by_clinic = {ct["clinic_id"]: ct for ct in clinic_treatments}
        for clinic in clinics:
            ct = treatment_by_clinic.get(clinic["clinic_id"])
            if ct:
                # Apply price filters
                if min_price and ct["price"] < min_price:
                    continue
                if max_price and ct["price"] > max_price:
                    continue
                clinic["treatment_price"] = ct["price"]
                clinic["treatment_duration"] = ct["duration_days"]
        
        # Filter by price after adding
        if min_price or max_price:
            clinics = [c for c in clinics if "treatment_price" in c]
            if min_price:
                clinics = [c for c in clinics if c["treatment_price"] >= min_price]
            if max_price:
                clinics = [c for c in clinics if c["treatment_price"] <= max_price]
    
    return clinics

@api_router.get("/clinics/{clinic_id}")
async def get_clinic(clinic_id: str):
    clinic = await db.clinics.find_one({"clinic_id": clinic_id}, {"_id": 0})
    if not clinic:
        raise HTTPException(status_code=404, detail="Clínica no encontrada")
    
    # Get treatments for this clinic
    clinic_treatments = await db.clinic_treatments.find(
        {"clinic_id": clinic_id},
        {"_id": 0}
    ).to_list(100)
    
    # Get treatment details
    treatments_with_details = []
    for ct in clinic_treatments:
        treatment = await db.treatments.find_one(
            {"treatment_id": ct["treatment_id"]},
            {"_id": 0}
        )
        if treatment:
            treatments_with_details.append({
                **treatment,
                "price": ct["price"],
                "duration_days": ct["duration_days"],
                "warranty_months": ct["warranty_months"],
                "process_steps": ct["process_steps"],
                "includes": ct["includes"]
            })
    
    clinic["treatments"] = treatments_with_details
    return clinic

@api_router.get("/cities")
async def get_cities():
    """Get unique cities from clinics"""
    clinics = await db.clinics.find({}, {"_id": 0, "city": 1}).to_list(1000)
    cities = list(set(c["city"] for c in clinics))
    return sorted(cities)

# ==================== COMPARE ENDPOINTS ====================

@api_router.post("/compare")
async def compare_treatments(compare_data: CompareRequest):
    if len(compare_data.clinic_ids) < 2:
        raise HTTPException(status_code=400, detail="Se necesitan al menos 2 clínicas para comparar")
    
    # Get treatment info
    treatment = await db.treatments.find_one(
        {"treatment_id": compare_data.treatment_id},
        {"_id": 0}
    )
    if not treatment:
        raise HTTPException(status_code=404, detail="Tratamiento no encontrado")
    
    comparison_data = []
    
    for clinic_id in compare_data.clinic_ids:
        clinic = await db.clinics.find_one({"clinic_id": clinic_id}, {"_id": 0})
        if not clinic:
            continue
        
        clinic_treatment = await db.clinic_treatments.find_one(
            {"clinic_id": clinic_id, "treatment_id": compare_data.treatment_id},
            {"_id": 0}
        )
        
        if clinic_treatment:
            comparison_data.append({
                "clinic": clinic,
                "treatment": {
                    **treatment,
                    "price": clinic_treatment["price"],
                    "duration_days": clinic_treatment["duration_days"],
                    "warranty_months": clinic_treatment["warranty_months"],
                    "process_steps": clinic_treatment["process_steps"],
                    "includes": clinic_treatment["includes"]
                }
            })
    
    # Find best value (lowest price)
    if comparison_data:
        min_price = min(c["treatment"]["price"] for c in comparison_data)
        for c in comparison_data:
            c["is_best_value"] = c["treatment"]["price"] == min_price
    
    return {
        "treatment_name": treatment["name"],
        "comparisons": comparison_data
    }

# ==================== SEED DATA ====================

@api_router.post("/seed")
async def seed_database():
    """Seed database with sample data"""
    
    # Clear existing data
    await db.treatments.delete_many({})
    await db.clinics.delete_many({})
    await db.clinic_treatments.delete_many({})
    
    # Treatments
    treatments = [
        {
            "treatment_id": "implante-dental",
            "name": "Implante Dental",
            "description": "Reemplazo permanente de dientes perdidos con raíces artificiales de titanio",
            "category": "Implantología",
            "icon": "implant"
        },
        {
            "treatment_id": "ortodoncia-invisible",
            "name": "Ortodoncia Invisible",
            "description": "Alineadores transparentes para corregir la posición de los dientes",
            "category": "Ortodoncia",
            "icon": "aligners"
        },
        {
            "treatment_id": "blanqueamiento",
            "name": "Blanqueamiento Dental",
            "description": "Tratamiento para aclarar el color de los dientes",
            "category": "Estética",
            "icon": "sparkle"
        },
        {
            "treatment_id": "limpieza-dental",
            "name": "Limpieza Dental Profesional",
            "description": "Eliminación de placa y sarro para mantener encías sanas",
            "category": "Preventivo",
            "icon": "clean"
        },
        {
            "treatment_id": "endodoncia",
            "name": "Endodoncia",
            "description": "Tratamiento del nervio dental para salvar dientes dañados",
            "category": "Conservadora",
            "icon": "tooth"
        },
        {
            "treatment_id": "carillas-dentales",
            "name": "Carillas Dentales",
            "description": "Láminas finas de porcelana para mejorar la estética dental",
            "category": "Estética",
            "icon": "smile"
        }
    ]
    
    await db.treatments.insert_many(treatments)
    
    # Clinics
    clinics = [
        {
            "clinic_id": "clinica-dental-madrid-centro",
            "name": "Clínica Dental Madrid Centro",
            "description": "Especialistas en implantología y estética dental con más de 20 años de experiencia",
            "address": "Calle Gran Vía 45, 2º",
            "city": "Madrid",
            "postal_code": "28013",
            "latitude": 40.4200,
            "longitude": -3.7050,
            "phone": "+34 91 123 4567",
            "email": "info@dentalmadridcentro.es",
            "image_url": "https://images.unsplash.com/photo-1642844819197-5f5f21b89ff8?w=800",
            "rating": 4.8,
            "review_count": 234,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "clinic_id": "sonrisa-perfecta-barcelona",
            "name": "Sonrisa Perfecta Barcelona",
            "description": "Centro de ortodoncia avanzada y tratamientos estéticos",
            "address": "Passeig de Gràcia 78",
            "city": "Barcelona",
            "postal_code": "08008",
            "latitude": 41.3925,
            "longitude": 2.1650,
            "phone": "+34 93 234 5678",
            "email": "citas@sonrisaperfecta.es",
            "image_url": "https://images.pexels.com/photos/6812475/pexels-photo-6812475.jpeg?w=800",
            "rating": 4.6,
            "review_count": 189,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "clinic_id": "dental-wellness-valencia",
            "name": "Dental Wellness Valencia",
            "description": "Tu bienestar dental es nuestra prioridad. Tecnología de vanguardia",
            "address": "Avenida del Puerto 112",
            "city": "Valencia",
            "postal_code": "46023",
            "latitude": 39.4570,
            "longitude": -0.3545,
            "phone": "+34 96 345 6789",
            "email": "hola@dentalwellness.es",
            "image_url": "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800",
            "rating": 4.9,
            "review_count": 312,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "clinic_id": "clinica-innovadental-sevilla",
            "name": "Clínica InnovaDental Sevilla",
            "description": "Innovación y tecnología al servicio de tu sonrisa",
            "address": "Calle Sierpes 52",
            "city": "Sevilla",
            "postal_code": "41004",
            "latitude": 37.3891,
            "longitude": -5.9945,
            "phone": "+34 95 456 7890",
            "email": "contacto@innovadental.es",
            "image_url": "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800",
            "rating": 4.7,
            "review_count": 156,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "clinic_id": "dentistas-bilbao",
            "name": "Dentistas Asociados Bilbao",
            "description": "Red de especialistas dentales con atención personalizada",
            "address": "Gran Vía de Don Diego López de Haro 25",
            "city": "Bilbao",
            "postal_code": "48009",
            "latitude": 43.2630,
            "longitude": -2.9350,
            "phone": "+34 94 567 8901",
            "email": "info@dentistasbilbao.es",
            "image_url": "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800",
            "rating": 4.5,
            "review_count": 98,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.clinics.insert_many(clinics)
    
    # Clinic Treatments (prices and details for each clinic-treatment combo)
    clinic_treatments = [
        # Madrid Centro
        {
            "id": f"ct_{uuid.uuid4().hex[:8]}",
            "clinic_id": "clinica-dental-madrid-centro",
            "treatment_id": "implante-dental",
            "price": 1200,
            "duration_days": 90,
            "warranty_months": 120,
            "process_steps": [
                "Estudio inicial y radiografía 3D",
                "Planificación digital del implante",
                "Colocación del implante",
                "Período de osteointegración (3 meses)",
                "Colocación de la corona definitiva"
            ],
            "includes": ["Implante de titanio", "Corona de porcelana", "Seguimiento 1 año", "Garantía 10 años"]
        },
        {
            "id": f"ct_{uuid.uuid4().hex[:8]}",
            "clinic_id": "clinica-dental-madrid-centro",
            "treatment_id": "blanqueamiento",
            "price": 299,
            "duration_days": 1,
            "warranty_months": 12,
            "process_steps": [
                "Limpieza dental previa",
                "Protección de encías",
                "Aplicación de gel blanqueador",
                "Activación con luz LED",
                "Revisión del resultado"
            ],
            "includes": ["Kit de mantenimiento", "Revisión al mes", "Férulas personalizadas"]
        },
        {
            "id": f"ct_{uuid.uuid4().hex[:8]}",
            "clinic_id": "clinica-dental-madrid-centro",
            "treatment_id": "ortodoncia-invisible",
            "price": 3500,
            "duration_days": 365,
            "warranty_months": 24,
            "process_steps": [
                "Escáner digital 3D",
                "Plan de tratamiento personalizado",
                "Fabricación de alineadores",
                "Revisiones cada 2 semanas",
                "Retenedores finales"
            ],
            "includes": ["Todos los alineadores", "Retenedores", "Revisiones ilimitadas", "Refinamientos incluidos"]
        },
        # Barcelona
        {
            "id": f"ct_{uuid.uuid4().hex[:8]}",
            "clinic_id": "sonrisa-perfecta-barcelona",
            "treatment_id": "implante-dental",
            "price": 1350,
            "duration_days": 120,
            "warranty_months": 60,
            "process_steps": [
                "Diagnóstico completo",
                "Cirugía de implante",
                "Cicatrización guiada",
                "Impresiones digitales",
                "Corona final"
            ],
            "includes": ["Implante premium", "Corona cerámica", "Seguimiento 6 meses"]
        },
        {
            "id": f"ct_{uuid.uuid4().hex[:8]}",
            "clinic_id": "sonrisa-perfecta-barcelona",
            "treatment_id": "ortodoncia-invisible",
            "price": 2900,
            "duration_days": 300,
            "warranty_months": 36,
            "process_steps": [
                "Estudio ortodóntico",
                "Simulación del resultado",
                "Alineadores secuenciales",
                "Controles mensuales",
                "Retención final"
            ],
            "includes": ["Alineadores completos", "App de seguimiento", "Retenedor fijo y removible"]
        },
        {
            "id": f"ct_{uuid.uuid4().hex[:8]}",
            "clinic_id": "sonrisa-perfecta-barcelona",
            "treatment_id": "carillas-dentales",
            "price": 450,
            "duration_days": 14,
            "warranty_months": 60,
            "process_steps": [
                "Diseño de sonrisa digital",
                "Preparación dental mínima",
                "Impresiones de precisión",
                "Fabricación en laboratorio",
                "Cementado definitivo"
            ],
            "includes": ["Carilla de porcelana por pieza", "Diseño personalizado", "Garantía 5 años"]
        },
        # Valencia
        {
            "id": f"ct_{uuid.uuid4().hex[:8]}",
            "clinic_id": "dental-wellness-valencia",
            "treatment_id": "implante-dental",
            "price": 990,
            "duration_days": 75,
            "warranty_months": 180,
            "process_steps": [
                "TAC dental gratuito",
                "Cirugía guiada por ordenador",
                "Implante de carga inmediata",
                "Corona provisional mismo día",
                "Corona definitiva a los 3 meses"
            ],
            "includes": ["Implante Nobel Biocare", "Corona zirconio", "Garantía de por vida", "Financiación 0%"]
        },
        {
            "id": f"ct_{uuid.uuid4().hex[:8]}",
            "clinic_id": "dental-wellness-valencia",
            "treatment_id": "blanqueamiento",
            "price": 199,
            "duration_days": 1,
            "warranty_months": 6,
            "process_steps": [
                "Valoración del color inicial",
                "Limpieza profesional",
                "Blanqueamiento con láser",
                "Aplicación de flúor",
                "Consejos de mantenimiento"
            ],
            "includes": ["Sesión completa", "Kit domiciliario", "Revisión gratuita"]
        },
        {
            "id": f"ct_{uuid.uuid4().hex[:8]}",
            "clinic_id": "dental-wellness-valencia",
            "treatment_id": "limpieza-dental",
            "price": 45,
            "duration_days": 1,
            "warranty_months": 0,
            "process_steps": [
                "Exploración bucal",
                "Eliminación de sarro",
                "Pulido dental",
                "Aplicación de flúor"
            ],
            "includes": ["Limpieza completa", "Revisión gratuita"]
        },
        # Sevilla
        {
            "id": f"ct_{uuid.uuid4().hex[:8]}",
            "clinic_id": "clinica-innovadental-sevilla",
            "treatment_id": "implante-dental",
            "price": 1100,
            "duration_days": 100,
            "warranty_months": 120,
            "process_steps": [
                "Estudio radiológico",
                "Planificación 3D",
                "Cirugía de implante",
                "Osteointegración",
                "Prótesis final"
            ],
            "includes": ["Implante Straumann", "Corona E-max", "Controles incluidos"]
        },
        {
            "id": f"ct_{uuid.uuid4().hex[:8]}",
            "clinic_id": "clinica-innovadental-sevilla",
            "treatment_id": "endodoncia",
            "price": 180,
            "duration_days": 1,
            "warranty_months": 24,
            "process_steps": [
                "Radiografía diagnóstica",
                "Anestesia local",
                "Acceso al nervio",
                "Limpieza de conductos",
                "Sellado definitivo"
            ],
            "includes": ["Tratamiento completo", "Radiografía control", "Reconstrucción básica"]
        },
        {
            "id": f"ct_{uuid.uuid4().hex[:8]}",
            "clinic_id": "clinica-innovadental-sevilla",
            "treatment_id": "ortodoncia-invisible",
            "price": 3200,
            "duration_days": 330,
            "warranty_months": 24,
            "process_steps": [
                "Escáner iTero",
                "Clincheck virtual",
                "Juego de alineadores",
                "Revisiones periódicas",
                "Retención"
            ],
            "includes": ["Tratamiento Invisalign", "Blanqueamiento gratis", "Retenedores"]
        },
        # Bilbao
        {
            "id": f"ct_{uuid.uuid4().hex[:8]}",
            "clinic_id": "dentistas-bilbao",
            "treatment_id": "implante-dental",
            "price": 1050,
            "duration_days": 85,
            "warranty_months": 60,
            "process_steps": [
                "Consulta inicial",
                "Planificación quirúrgica",
                "Colocación implante",
                "Cicatrización",
                "Corona cerámica"
            ],
            "includes": ["Implante Zimmer", "Corona porcelana", "Seguimiento anual"]
        },
        {
            "id": f"ct_{uuid.uuid4().hex[:8]}",
            "clinic_id": "dentistas-bilbao",
            "treatment_id": "blanqueamiento",
            "price": 250,
            "duration_days": 1,
            "warranty_months": 12,
            "process_steps": [
                "Evaluación dental",
                "Limpieza previa",
                "Blanqueamiento profesional",
                "Revisión resultado"
            ],
            "includes": ["Tratamiento en clínica", "Kit casero", "Control"]
        },
        {
            "id": f"ct_{uuid.uuid4().hex[:8]}",
            "clinic_id": "dentistas-bilbao",
            "treatment_id": "limpieza-dental",
            "price": 55,
            "duration_days": 1,
            "warranty_months": 0,
            "process_steps": [
                "Inspección bucal",
                "Ultrasonidos",
                "Pulido",
                "Flúor protector"
            ],
            "includes": ["Limpieza profesional", "Consejos de higiene"]
        }
    ]
    
    await db.clinic_treatments.insert_many(clinic_treatments)
    
    return {
        "message": "Base de datos inicializada correctamente",
        "treatments": len(treatments),
        "clinics": len(clinics),
        "clinic_treatments": len(clinic_treatments)
    }

# ==================== ROOT ====================

@api_router.get("/")
async def root():
    return {"message": "DentiCompare API v1.0"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

# Include the router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
