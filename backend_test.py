import requests
import sys
import json
from datetime import datetime

class DentiCompareAPITester:
    def __init__(self, base_url="https://denticompare.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                self.log_test(name, True)
                try:
                    return True, response.json() if response.content else {}
                except:
                    return True, {}
            else:
                error_detail = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_body = response.json()
                    error_detail += f" - {error_body}"
                except:
                    error_detail += f" - {response.text[:200]}"
                self.log_test(name, False, error_detail)
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_health_endpoints(self):
        """Test basic health endpoints"""
        print("\n=== TESTING HEALTH ENDPOINTS ===")
        
        # Test root endpoint
        self.run_test("Root endpoint", "GET", "", 200)
        
        # Test health endpoint
        self.run_test("Health endpoint", "GET", "health", 200)

    def test_seed_database(self):
        """Test database seeding"""
        print("\n=== TESTING DATABASE SEEDING ===")
        
        success, response = self.run_test("Seed database", "POST", "seed", 200)
        if success:
            print(f"   Seeded: {response.get('treatments', 0)} treatments, {response.get('clinics', 0)} clinics")

    def test_treatments_endpoints(self):
        """Test treatments endpoints"""
        print("\n=== TESTING TREATMENTS ENDPOINTS ===")
        
        # Get all treatments
        success, treatments = self.run_test("Get all treatments", "GET", "treatments", 200)
        
        if success and treatments:
            print(f"   Found {len(treatments)} treatments")
            
            # Test individual treatment
            first_treatment = treatments[0]
            treatment_id = first_treatment.get('treatment_id')
            if treatment_id:
                self.run_test(f"Get treatment {treatment_id}", "GET", f"treatments/{treatment_id}", 200)
            
            # Test non-existent treatment
            self.run_test("Get non-existent treatment", "GET", "treatments/non-existent", 404)

    def test_cities_endpoint(self):
        """Test cities endpoint"""
        print("\n=== TESTING CITIES ENDPOINT ===")
        
        success, cities = self.run_test("Get cities", "GET", "cities", 200)
        if success:
            print(f"   Found {len(cities)} cities: {cities}")

    def test_clinics_endpoints(self):
        """Test clinics endpoints"""
        print("\n=== TESTING CLINICS ENDPOINTS ===")
        
        # Get all clinics
        success, clinics = self.run_test("Get all clinics", "GET", "clinics", 200)
        
        if success and clinics:
            print(f"   Found {len(clinics)} clinics")
            
            # Test clinic filters
            self.run_test("Filter by city", "GET", "clinics?city=Madrid", 200)
            self.run_test("Filter by rating", "GET", "clinics?min_rating=4.5", 200)
            
            # Test individual clinic
            first_clinic = clinics[0]
            clinic_id = first_clinic.get('clinic_id')
            if clinic_id:
                success, clinic_detail = self.run_test(f"Get clinic {clinic_id}", "GET", f"clinics/{clinic_id}", 200)
                if success:
                    treatments = clinic_detail.get('treatments', [])
                    print(f"   Clinic has {len(treatments)} treatments")
            
            # Test non-existent clinic
            self.run_test("Get non-existent clinic", "GET", "clinics/non-existent", 404)

    def test_compare_endpoint(self):
        """Test compare endpoint"""
        print("\n=== TESTING COMPARE ENDPOINT ===")
        
        # First get some clinics and treatments
        success, clinics = self.run_test("Get clinics for comparison", "GET", "clinics", 200)
        success2, treatments = self.run_test("Get treatments for comparison", "GET", "treatments", 200)
        
        if success and success2 and len(clinics) >= 2 and treatments:
            clinic_ids = [clinics[0]['clinic_id'], clinics[1]['clinic_id']]
            treatment_id = treatments[0]['treatment_id']
            
            compare_data = {
                "clinic_ids": clinic_ids,
                "treatment_id": treatment_id
            }
            
            self.run_test("Compare clinics", "POST", "compare", 200, compare_data)
            
            # Test invalid comparison (only 1 clinic)
            invalid_data = {
                "clinic_ids": [clinic_ids[0]],
                "treatment_id": treatment_id
            }
            self.run_test("Compare with insufficient clinics", "POST", "compare", 400, invalid_data)

    def test_auth_endpoints(self):
        """Test authentication endpoints"""
        print("\n=== TESTING AUTH ENDPOINTS ===")
        
        # Test register
        test_email = f"test.user.{int(datetime.now().timestamp())}@example.com"
        register_data = {
            "name": "Test User",
            "email": test_email,
            "password": "testpass123"
        }
        
        success, response = self.run_test("Register user", "POST", "auth/register", 200, register_data)
        if success:
            self.token = response.get('token')
            print(f"   Registered user: {response.get('email')}")
        
        # Test login
        login_data = {
            "email": test_email,
            "password": "testpass123"
        }
        
        success, response = self.run_test("Login user", "POST", "auth/login", 200, login_data)
        if success:
            self.token = response.get('token')
            print(f"   Logged in user: {response.get('email')}")
        
        # Test /me endpoint
        if self.token:
            self.run_test("Get current user", "GET", "auth/me", 200)
        
        # Test logout
        self.run_test("Logout user", "POST", "auth/logout", 200)
        
        # Test invalid login
        invalid_login = {
            "email": "invalid@example.com",
            "password": "wrongpass"
        }
        self.run_test("Invalid login", "POST", "auth/login", 401, invalid_login)

    def run_all_tests(self):
        """Run all tests"""
        print("🚀 Starting DentiCompare API Tests")
        print(f"Testing against: {self.base_url}")
        
        try:
            self.test_health_endpoints()
            self.test_seed_database()
            self.test_treatments_endpoints()
            self.test_cities_endpoint()
            self.test_clinics_endpoints()
            self.test_compare_endpoint()
            self.test_auth_endpoints()
            
        except Exception as e:
            print(f"\n💥 Test suite failed with exception: {e}")
            return False
        
        # Print summary
        print(f"\n📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"Success rate: {success_rate:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print("⚠️  Some tests failed")
            return False

def main():
    tester = DentiCompareAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())