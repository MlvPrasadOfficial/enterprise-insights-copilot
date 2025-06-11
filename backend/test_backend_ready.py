"""
Quick backend connectivity test for Enterprise Insights Copilot
"""
import sys
import os
import importlib.util

def test_backend_imports():
    """Test if main backend dependencies are available"""
    required_modules = [
        'fastapi',
        'uvicorn',
        'pandas',
        'python-dotenv'
    ]
    
    missing = []
    for module in required_modules:
        try:
            if module == 'python-dotenv':
                import dotenv
            else:
                __import__(module)
            print(f"✅ {module}")
        except ImportError:
            missing.append(module)
            print(f"❌ {module} - MISSING")
    
    return len(missing) == 0

def test_env_file():
    """Test if .env file exists and has required variables"""
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
    if os.path.exists(env_path):
        print(f"✅ .env file found at: {env_path}")
        return True
    else:
        print(f"❌ .env file not found at: {env_path}")
        return False

def test_main_py():
    """Test if main.py exists and can be imported"""
    main_path = os.path.join(os.path.dirname(__file__), 'main.py')
    if os.path.exists(main_path):
        print(f"✅ main.py found at: {main_path}")
        return True
    else:
        print(f"❌ main.py not found at: {main_path}")
        return False

if __name__ == "__main__":
    print("🧪 Testing Enterprise Insights Copilot Backend")
    print("=" * 50)
    
    imports_ok = test_backend_imports()
    env_ok = test_env_file()
    main_ok = test_main_py()
    
    print("\n" + "=" * 50)
    if imports_ok and env_ok and main_ok:
        print("✅ Backend ready to start!")
        print("💡 Run: python main.py")
    else:
        print("❌ Backend setup incomplete")
        if not imports_ok:
            print("   → Install missing packages: pip install -r requirements.txt")
        if not env_ok:
            print("   → Create .env file with required variables")
        if not main_ok:
            print("   → Ensure main.py exists in backend directory")
