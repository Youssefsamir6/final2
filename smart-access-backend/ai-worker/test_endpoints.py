#!/usr/bin/env python
"""
Quick test script for AI Worker endpoints.
Run this after starting app.py to verify the service is working.
"""

import requests
import json
import sys
from time import sleep

AI_WORKER_URL = "http://localhost:5000"
BACKEND_URL = "http://localhost:3000"

def print_header(text):
    print(f"\n{'='*60}")
    print(f"  {text}")
    print(f"{'='*60}\n")

def test_ai_worker():
    """Test AI Worker endpoints"""
    print_header("Testing AI Worker (Port 5000)")
    
    # Test 1: Health Check
    print("1️⃣  Health Check")
    try:
        response = requests.get(f"{AI_WORKER_URL}/health", timeout=5)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {json.dumps(response.json(), indent=2)}")
        print("   ✅ AI Worker is responding\n")
    except Exception as e:
        print(f"   ❌ Error: {e}")
        print("   Make sure AI Worker is running: python app.py\n")
        return False
    
    # Test 2: Database Status
    print("2️⃣  Database Status")
    try:
        response = requests.get(f"{AI_WORKER_URL}/db-status", timeout=5)
        print(f"   Status: {response.status_code}")
        data = response.json()
        print(f"   People in database: {data.get('people', 0)}")
        print(f"   Database ready: {data.get('ready', False)}")
        print(f"   ✅ Database check successful\n")
    except Exception as e:
        print(f"   ❌ Error: {e}\n")
    
    # Show endpoints
    print("3️⃣  Available Endpoints on AI Worker:")
    endpoints = [
        ("GET", "/health", "Health check"),
        ("GET", "/db-status", "Database status"),
        ("POST", "/recognize", "Recognize face"),
        ("POST", "/embedding", "Extract face embedding"),
        ("POST", "/add-person", "Add person to database"),
        ("POST", "/rebuild-db", "Rebuild database"),
    ]
    
    for method, path, description in endpoints:
        print(f"   {method:6} {path:20} - {description}")
    
    return True

def test_backend():
    """Test Backend endpoints"""
    print_header("Testing Backend (Port 3000)")
    
    print("1️⃣  Checking Backend Status")
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=5)
        print(f"   Status: {response.status_code}")
        print("   ✅ Backend is responding\n")
    except Exception as e:
        print(f"   ⚠️  Backend not responding: {e}")
        print("   Make sure backend is running: node server.js\n")
        print("   (Backend is optional for AI Worker to work)\n")
        return False
    
    # Show some endpoints
    print("2️⃣  Key Backend Endpoints:")
    endpoints = [
        ("POST", "/api/auth/login", "User login"),
        ("POST", "/api/auth/register", "User registration"),
        ("GET", "/api/users", "Get users"),
        ("POST", "/api/ai/device/smart-access", "Face verification"),
    ]
    
    for method, path, description in endpoints:
        print(f"   {method:6} {path:35} - {description}")
    
    return True

def explain_architecture():
    """Show the system architecture"""
    print_header("System Architecture")
    
    print("""
    Your system has TWO separate services:
    
    ┌─────────────────────────────────────────────────────┐
    │  Client (Web/Mobile)                                │
    └─────────────────────────────────────────────────────┘
               │                          │
               │                          │
    [POST /api/auth/login]      [POST /recognize]
               │                          │
               ▼                          ▼
    ┌──────────────────────┐   ┌──────────────────────┐
    │  BACKEND (Port 3000) │   │ AI WORKER (Port 5000)│
    │   Node.js/Express    │   │   Python/FastAPI     │
    │                      │   │                      │
    │ • Authentication ✅  │   │ • Face recognition   │
    │ • User management    │   │ • Embeddings         │
    │ • Access control     │   │ • Database mgmt      │
    │ • Business logic     │   │ • Model serving      │
    └──────────────────────┘   └──────────────────────┘
               │                          ▲
               └──────────────────────────┘
          Calls AI Worker when needed
    
    KEY POINTS:
    ✓ Authentication → Backend (port 3000)
    ✓ Face recognition → AI Worker (port 5000)
    ✓ Both must run for full system
    """)

def main():
    print("\n" + "="*60)
    print(" 🔧 Smart Access System Test")
    print("="*60)
    
    ai_ok = test_ai_worker()
    backend_ok = test_backend()
    
    explain_architecture()
    
    print_header("Summary")
    print(f"  AI Worker (5000):  {'✅ OK' if ai_ok else '❌ Not responding'}")
    print(f"  Backend (3000):    {'✅ OK' if backend_ok else '⚠️  Not responding (optional)'}")
    
    if ai_ok:
        print(f"\n  ✅ AI Worker is ready!")
        print(f"  📍 Next steps:")
        print(f"     1. Ensure Backend is running on port 3000")
        print(f"     2. Send requests to correct server:")
        print(f"        - Auth → http://localhost:3000/api/auth/login")
        print(f"        - AI → http://localhost:5000/recognize")
    else:
        print(f"\n  ❌ AI Worker is NOT responding!")
        print(f"  Start it with: python app.py")
    
    print("\n" + "="*60 + "\n")

if __name__ == "__main__":
    main()
