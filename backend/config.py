import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'default-secret-key')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///summarizer.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')
    GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', os.environ.get('VITE_GOOGLE_CLIENT_ID', ''))
    GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET', '')
    EMAIL_SERVICE_API_KEY = os.environ.get('EMAIL_SERVICE_API_KEY', '')

