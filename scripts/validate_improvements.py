#!/usr/bin/env python3
"""
Validation script for Enterprise Insights Copilot improvements.

This script validates:
1. Code consolidation (no duplicate main files)
2. Security hardening (proper .env configuration, CORS, API keys)
3. Error handling standardization
4. Configuration validation
5. Basic functionality tests

Usage:
    python scripts/validate_improvements.py
"""

import os
import sys
import json
import time
import requests
from pathlib import Path
from dotenv import load_dotenv

# Add project root to path
PROJECT_ROOT = Path(__file__).parent.parent.absolute()
sys.path.insert(0, str(PROJECT_ROOT))

def print_section(title):
    """Print a formatted section header."""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")

def print_status(check, status, message=""):
    """Print a status check result."""
    icon = "✅" if status else "❌"
    status_text = "PASS" if status else "FAIL"
    print(f"{icon} {check}: {status_text}")
    if message:
        print(f"   └─ {message}")

def validate_code_consolidation():
    """Validate that duplicate files have been removed."""
    print_section("CODE CONSOLIDATION VALIDATION")
    
    backend_dir = PROJECT_ROOT / "backend"
    
    # Check that main_fixed.py is removed
    main_fixed_exists = (backend_dir / "main_fixed.py").exists()
    print_status("Duplicate main_fixed.py removed", not main_fixed_exists)
    
    # Check that main.py exists
    main_exists = (backend_dir / "main.py").exists()
    print_status("Primary main.py exists", main_exists)
    
    # Check that backup exists
    backup_exists = (backend_dir / "main_fixed_backup.py").exists()
    print_status("Backup file created", backup_exists)
    
    return not main_fixed_exists and main_exists

def validate_env_configuration():
    """Validate .env file configuration."""
    print_section("ENVIRONMENT CONFIGURATION VALIDATION")
    
    env_file = PROJECT_ROOT / ".env"
    env_exists = env_file.exists()
    print_status(".env file exists", env_exists)
    
    if not env_exists:
        return False
    
    # Load environment variables
    load_dotenv(env_file)
    
    # Check required variables
    required_vars = [
        "OPENAI_API_KEY",
        "PINECONE_API_KEY", 
        "PINECONE_ENV",
        "ALLOWED_ORIGINS",
        "LANGSMITH_PROJECT"
    ]
    
    all_vars_present = True
    for var in required_vars:
        value = os.getenv(var)
        present = value is not None and value.strip() != ""
        print_status(f"Environment variable {var}", present)
        if not present:
            all_vars_present = False
    
    # Check security configurations
    allowed_origins = os.getenv("ALLOWED_ORIGINS", "")
    no_wildcard_cors = "*" not in allowed_origins
    print_status("No wildcard CORS (*) configuration", no_wildcard_cors)
    
    api_key = os.getenv("API_KEY")
    api_key_configured = api_key is not None and len(api_key) > 10
    print_status("API key configured", api_key_configured)
    
    return all_vars_present and no_wildcard_cors

def validate_security_headers():
    """Validate security improvements in the code."""
    print_section("SECURITY HARDENING VALIDATION")
    
    main_file = PROJECT_ROOT / "backend" / "main.py"
    
    if not main_file.exists():
        print_status("main.py file accessible", False)
        return False
    
    content = main_file.read_text(encoding='utf-8')
    
    # Check for security headers
    security_checks = [
        ("Enhanced CORS configuration", "allow_origins=ALLOWED_ORIGINS" in content and "allow_origins=[\"*\"]" not in content),
        ("Security headers middleware", "X-Content-Type-Options" in content and "X-Frame-Options" in content),
        ("CSP header", "Content-Security-Policy" in content),
        ("HSTS header", "Strict-Transport-Security" in content),
        ("Request ID tracking", "X-Request-ID" in content),
        ("Environment-based config", "get_env_var" in content),
        ("Structured error responses", '"error":' in content and '"timestamp":' in content),
        ("API key validation", "get_api_key" in content and "Invalid or missing API key" in content),
        ("LangSmith env config", "LANGSMITH_TRACING" in content and "get_env_var" in content),
    ]
    
    passed_checks = 0
    for check, condition in security_checks:
        print_status(check, condition)
        if condition:
            passed_checks += 1
    
    return passed_checks >= 7  # At least 7 out of 9 checks should pass

def validate_error_handling():
    """Validate standardized error handling."""
    print_section("ERROR HANDLING VALIDATION")
    
    main_file = PROJECT_ROOT / "backend" / "main.py"
    content = main_file.read_text(encoding='utf-8')
    
    error_checks = [
        ("Structured error responses", '"error":' in content and '"message":' in content),
        ("Request ID in errors", '"request_id":' in content),
        ("Timestamp in errors", '"timestamp":' in content),
        ("Exception logging", "logger.error" in content),
        ("HTTP exception handling", "@app.exception_handler(Exception)" in content),
        ("Validation error handling", "RequestValidationError" in content),
        ("Process time tracking", "process_time" in content),
        ("Debug mode check", 'get_env_var("DEBUG"' in content),
    ]
    
    passed_checks = 0
    for check, condition in error_checks:
        print_status(check, condition)
        if condition:
            passed_checks += 1
    
    return passed_checks >= 6

def validate_file_upload_security():
    """Validate file upload security improvements."""
    print_section("FILE UPLOAD SECURITY VALIDATION")
    
    main_file = PROJECT_ROOT / "backend" / "main.py"
    content = main_file.read_text(encoding='utf-8')
    
    upload_checks = [
        ("Environment-based file size limit", 'get_env_var("MAX_FILE_SIZE_MB"' in content),
        ("File size validation", "File too large" in content),
        ("File extension validation", "filename" in content),
        ("Temp file handling", "tempfile" in content),
        ("Upload logging", "[UPLOAD]" in content),
        ("Memory monitoring", "psutil" in content and "memory_info" in content),
    ]
    
    passed_checks = 0
    for check, condition in upload_checks:
        print_status(check, condition)
        if condition:
            passed_checks += 1
    
    return passed_checks >= 5

def test_backend_startup():
    """Test if the backend can start without errors."""
    print_section("BACKEND STARTUP TEST")
    
    try:
        # Import the main module to check for import errors
        sys.path.insert(0, str(PROJECT_ROOT / "backend"))
        
        # Test configuration loading
        from config.config import get_env_var
        print_status("Configuration module import", True)
        
        # Test core modules
        from backend.core.logging import logger
        print_status("Logging module import", True)
        
        from backend.core.models import get_openai_client
        print_status("Models module import", True)
        
        # Test that environment variables are loaded
        openai_key = get_env_var("OPENAI_API_KEY", required=False)
        env_loaded = openai_key is not None
        print_status("Environment variables loaded", env_loaded)
        
        return True
        
    except Exception as e:
        print_status("Backend startup test", False, str(e))
        return False

def test_api_endpoints():
    """Test basic API endpoint availability (if backend is running)."""
    print_section("API ENDPOINTS TEST")
    
    base_url = "http://localhost:8000"
    
    # Test health endpoints
    endpoints_to_test = [
        "/health",
        "/healthz",
        "/healthcheck"
    ]
    
    backend_running = False
    for endpoint in endpoints_to_test:
        try:
            response = requests.get(f"{base_url}{endpoint}", timeout=2)
            if response.status_code == 200:
                print_status(f"Health endpoint {endpoint}", True)
                backend_running = True
                break
        except:
            continue
    
    if not backend_running:
        print_status("Backend server running", False, "Start backend with: python backend/main.py")
        return False
    
    # Test API documentation
    try:
        response = requests.get(f"{base_url}/docs", timeout=2)
        docs_available = response.status_code == 200
        print_status("API documentation available", docs_available)
    except:
        print_status("API documentation available", False)
    
    return backend_running

def generate_summary_report():
    """Generate a summary report of all validations."""
    print_section("VALIDATION SUMMARY REPORT")
    
    # Run all validations
    results = {
        "Code Consolidation": validate_code_consolidation(),
        "Environment Configuration": validate_env_configuration(),
        "Security Hardening": validate_security_headers(),
        "Error Handling": validate_error_handling(),
        "File Upload Security": validate_file_upload_security(),
        "Backend Startup": test_backend_startup(),
        "API Endpoints": test_api_endpoints(),
    }
    
    print(f"\n{'='*60}")
    print("  FINAL RESULTS")
    print(f"{'='*60}")
    
    passed = sum(results.values())
    total = len(results)
    
    for category, result in results.items():
        icon = "✅" if result else "❌"
        print(f"{icon} {category}")
    
    print(f"\nOverall Score: {passed}/{total} ({(passed/total)*100:.1f}%)")
    
    if passed == total:
        print("\n🎉 All validations PASSED! The improvements have been successfully implemented.")
    elif passed >= total * 0.8:
        print(f"\n⚠️  Most validations passed ({passed}/{total}). Minor issues may need attention.")
    else:
        print(f"\n🚨 Several validations failed ({total-passed}/{total}). Review the issues above.")
    
    return passed >= total * 0.8

if __name__ == "__main__":
    print("Enterprise Insights Copilot - Improvements Validation")
    print(f"Project Root: {PROJECT_ROOT}")
    print(f"Validation Time: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    
    success = generate_summary_report()
    
    if success:
        print("\n✨ Validation completed successfully!")
        print("\n📋 Next Steps:")
        print("   1. Test the application: python backend/main.py")
        print("   2. Run frontend: cd frontend && npm run dev")
        print("   3. Execute test suite: pytest tests/")
        print("   4. Review security settings before production deployment")
    else:
        print("\n🔧 Please address the failed validations before proceeding.")
    
    sys.exit(0 if success else 1)
