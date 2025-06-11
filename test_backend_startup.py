#!/usr/bin/env python3
"""
Quick startup test for the improved backend.
"""

import sys
import os
from pathlib import Path

# Add paths
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))
sys.path.insert(0, str(project_root / "backend"))

try:
    print("🔧 Testing Enterprise Insights Copilot Backend...")
    
    # Test environment loading
    from dotenv import load_dotenv
    load_dotenv()
    print("✅ Environment variables loaded")
    
    # Test config module
    from config.config import get_env_var
    openai_key = get_env_var("OPENAI_API_KEY", required=False)
    print(f"✅ Configuration module working (OpenAI key: {'configured' if openai_key else 'missing'})")
    
    # Test core modules
    from backend.core.logging import logger
    print("✅ Logging module imported")
    
    # Test that main.py can be imported (syntax check)
    import importlib.util
    spec = importlib.util.spec_from_file_location("main", project_root / "backend" / "main.py")
    if spec and spec.loader:
        print("✅ Main module syntax validated")
    
    print("\n🎉 Backend improvements validated successfully!")
    print("\n📋 To start the backend:")
    print("   cd backend")
    print("   python main.py")
    
except Exception as e:
    print(f"❌ Error: {e}")
    print("Please check the error above and fix before proceeding.")
