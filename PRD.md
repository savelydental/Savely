# DentiCompare - PRD (Product Requirements Document)

## Problema Original
Aplicación web responsive mobile-first para comparar clínicas dentales. Permite buscar clínicas, comparar tratamientos (precio, proceso, duración, garantías, valoraciones) entre distintas clínicas. Objetivo: reducir incertidumbre del paciente con transparencia en precios y procesos dentales.

## User Personas
1. **Usuario paciente**: Busca tratamientos dentales, quiere comparar precios y elegir clínica con información transparente
2. **Usuario registrado**: Puede guardar búsquedas y clínicas favoritas (futuro)

## Requisitos Core (Implementados)
- [x] Registro e inicio de sesión (JWT + Google OAuth via Emergent)
- [x] Buscador principal con filtros (ciudad, tratamiento, valoración, precio)
- [x] Listado de clínicas con valoración y precios
- [x] Comparador de tratamientos lado a lado
- [x] Ficha de clínica con tratamientos, contacto y mapa OpenStreetMap
- [x] Toggle modo claro/oscuro
- [x] Diseño responsive mobile-first
- [x] Datos de ejemplo (5 clínicas, 6 tratamientos, 15 relaciones)

## Stack Tecnológico
- **Frontend**: React + Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI (Python)
- **Base de datos**: MongoDB
- **Auth**: JWT + Google OAuth (Emergent Auth)
- **Mapas**: OpenStreetMap (iframe embed)

## Implementado (Dic 2024)
- Landing page con hero, buscador, tratamientos populares, clínicas destacadas
- Página de búsqueda con filtros avanzados
- Ficha de clínica con tabs de tratamientos
- Comparador de clínicas con "Mejor precio"
- Sistema de autenticación completo
- Toggle tema claro/oscuro
- Diseño "Organic Clinical" (Teal + Coral)
- Tipografía Manrope + Inter

## Backlog P0 (Alta prioridad)
- [ ] Sistema de valoraciones reales de usuarios
- [ ] Solicitud de cita desde la app
- [ ] Favoritos/guardados para usuarios registrados

## Backlog P1 (Media prioridad)
- [ ] Panel de administración para clínicas
- [ ] Filtro por rango de precio más preciso
- [ ] Notificaciones por email
- [ ] Historial de búsquedas

## Backlog P2 (Baja prioridad)
- [ ] Comparador de múltiples tratamientos
- [ ] Chat con clínicas
- [ ] App móvil nativa
