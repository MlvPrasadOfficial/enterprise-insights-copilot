@echo off
echo 🚀 Setting up Enterprise Insights Copilot...

python -m venv venv
call venv\Scripts\activate

pip install -r requirements.txt

echo ✅ Setup complete.
echo Run: cd backend && uvicorn main:app --reload --port 8000
echo Then: cd frontend && streamlit run app.py
