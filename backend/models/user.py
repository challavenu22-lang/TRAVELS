from datetime import datetime
from app import db
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.String, primary_key=True, default=generate_uuid)
    full_name = db.Column(db.String(100), nullable=False)
    username = db.Column(db.String(30), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    profile_image = db.Column(db.String(255), nullable=True)
    role = db.Column(db.String(20), default='user')
    reset_token = db.Column(db.String(255), nullable=True)
    reset_token_expiry = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    reports = db.relationship('Report', backref='author', lazy=True)
    settings = db.relationship('Settings', backref='user', uselist=False, lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.full_name,
            'full_name': self.full_name,
            'username': self.username,
            'email': self.email,
            'profile_image': self.profile_image,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
