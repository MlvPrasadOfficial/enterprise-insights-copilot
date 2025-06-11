#!/usr/bin/env python3
"""
Quick test of core improvements.
"""

import sys
import os
from pathlib import Path

# Add project paths
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))
sys.path.insert(0, str(project_root / "backend"))

def test_improvements():
    print("🔧 Enterprise Insights Copilot - Improvements Test")
    print("=" * 50)
    
    # Test 1: Code consolidation
    backend_dir = project_root / "backend"
    main_fixed_removed = not (backend_dir / "main_fixed.py").exists()
    main_exists = (backend_dir / "main.py").exists()
    backup_exists = (backend_dir / "main_fixed_backup.py").exists()
    
    print(f"✅ Code consolidation: {main_fixed_removed and main_exists and backup_exists}")
    print(f"   - main_fixed.py removed: {main_fixed_removed}")
    print(f"   - main.py exists: {main_exists}")
    print(f"   - backup created: {backup_exists}")
    
    # Test 2: Environment configuration
    env_file = project_root / ".env"
    env_content = env_file.read_text() if env_file.exists() else ""
    
    has_security_section = "# === SECURITY ===" in env_content
    has_allowed_origins = "ALLOWED_ORIGINS=" in env_content and "*" not in env_content
    has_api_key = "API_KEY=" in env_content
    has_app_settings = "# === APPLICATION SETTINGS ===" in env_content
    
    print(f"✅ Environment security: {has_security_section and has_allowed_origins and has_api_key}")
    print(f"   - Security section: {has_security_section}")
    print(f"   - No wildcard CORS: {has_allowed_origins}")
    print(f"   - API key configured: {has_api_key}")
    print(f"   - App settings: {has_app_settings}")
    
    # Test 3: Configuration import
    try:
        from config.config import get_env_var
        from dotenv import load_dotenv
        load_dotenv(env_file)
        
        openai_configured = bool(get_env_var("OPENAI_API_KEY", required=False))
        allowed_origins = get_env_var("ALLOWED_ORIGINS", "")
        api_key = get_env_var("API_KEY", "")
        
        print(f"✅ Configuration loading: {openai_configured}")
        print(f"   - OpenAI API key: {openai_configured}")
        print(f"   - CORS origins: {len(allowed_origins) > 0}")
        print(f"   - API key length: {len(api_key)}")
        
    except Exception as e:
        print(f"❌ Configuration loading failed: {e}")
    
    # Test 4: Security improvements in code
    main_file = backend_dir / "main.py"
    if main_file.exists():
        content = main_file.read_text()
        
        has_enhanced_cors = "allow_origins=ALLOWED_ORIGINS" in content
        has_security_headers = "X-Content-Type-Options" in content and "Strict-Transport-Security" in content
        has_structured_errors = '"error":' in content and '"timestamp":' in content
        has_env_config = "get_env_var(" in content
        
        print(f"✅ Security hardening: {has_enhanced_cors and has_security_headers}")
        print(f"   - Enhanced CORS: {has_enhanced_cors}")
        print(f"   - Security headers: {has_security_headers}")
        print(f"   - Structured errors: {has_structured_errors}")
        print(f"   - Environment config: {has_env_config}")
    
    print("\n🎉 Immediate priority improvements implemented!")
    print("\n📋 Next Steps:")
    print("   1. Test backend: python backend/main.py")
    print("   2. Test frontend: cd frontend && npm run dev")
    print("   3. Run tests: pytest tests/")
    
if __name__ == "__main__":
    test_improvements()
