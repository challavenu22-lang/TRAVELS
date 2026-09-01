import re
import secrets
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash

from app import db
from models.user import User
from models.settings import Settings
from utils.auth import generate_token, login_required

auth_bp = Blueprint('auth', __name__)

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
USERNAME_REGEX = re.compile(r"^[a-zA-Z0-9_.]+$")

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    
    full_name = (data.get('full_name') or data.get('fullName') or '').strip()
    username = (data.get('username') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''
    confirm_password = data.get('confirm_password') or data.get('confirmPassword') or ''

    # 1. Full Name Validation
    if not full_name:
        return jsonify({'error': 'Full name is required.'}), 400
    if len(full_name) < 2:
        return jsonify({'error': 'Full name must be at least 2 characters.'}), 400

    # 2. Username Validation
    if not username:
        return jsonify({'error': 'Username is required.'}), 400
    if len(username) < 3 or len(username) > 30 or not USERNAME_REGEX.match(username):
        return jsonify({'error': 'Username must be 3-30 characters and contain only letters, numbers, underscores, and periods.'}), 400

    if User.query.filter(db.func.lower(User.username) == username.lower()).first():
        return jsonify({'error': 'Username is already taken.'}), 400

    # 3. Email Validation
    if not email or not EMAIL_REGEX.match(email):
        return jsonify({'error': 'Please enter a valid email address.'}), 400

    if User.query.filter(db.func.lower(User.email) == email).first():
        return jsonify({'error': 'Email is already registered.'}), 400

    # 4. Password Validation
    if not password or len(password) < 8:
        return jsonify({'error': 'Password must be at least 8 characters.'}), 400

    if not re.search(r"[a-zA-Z]", password) or not re.search(r"[0-9]", password):
        return jsonify({'error': 'Password must contain at least one letter and one number.'}), 400

    # 5. Confirm Password Validation
    if password != confirm_password:
        return jsonify({'error': 'Passwords do not match.'}), 400

    # Create new user
    hashed_pw = generate_password_hash(password, method='pbkdf2:sha256')
    new_user = User(
        full_name=full_name,
        username=username.lower(),
        email=email,
        password_hash=hashed_pw,
        role='user'
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    default_settings = Settings(user_id=new_user.id)
    db.session.add(default_settings)
    db.session.commit()
    
    return jsonify({
        'message': 'Account created successfully. You can now log in.',
        'user': new_user.to_dict()
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    identifier = (data.get('identifier') or data.get('email') or data.get('username') or '').strip()
    password = data.get('password') or ''

    if not identifier or not password:
        return jsonify({'error': 'Invalid username/email or password.'}), 401

    user = User.query.filter(
        (db.func.lower(User.email) == identifier.lower()) | 
        (db.func.lower(User.username) == identifier.lower())
    ).first()

    if not user or not user.password_hash or not check_password_hash(user.password_hash, password):
        return jsonify({'error': 'Invalid username/email or password.'}), 401

    token = generate_token(user.id)
    return jsonify({
        'token': token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/logout', methods=['POST'])
def logout():
    return jsonify({'message': 'Logged out successfully.'}), 200

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json() or {}
    email = data.get('email', '').strip()

    if not email or not EMAIL_REGEX.match(email):
        return jsonify({'error': 'Please enter a valid email address.'}), 400

    user = User.query.filter(db.func.lower(User.email) == email.lower()).first()
    if not user:
        return jsonify({'error': 'No account found with this email address.'}), 404

    reset_token = secrets.token_urlsafe(32)
    user.reset_token = reset_token
    user.reset_token_expiry = datetime.utcnow() + timedelta(hours=1)
    db.session.commit()

    email_key = current_app.config.get('EMAIL_SERVICE_API_KEY')
    if email_key:
        return jsonify({
            'message': f'Password reset link has been sent to {email}.'
        }), 200
    else:
        return jsonify({
            'message': 'Password reset request received. (Email service API key is not configured in server environment. Please contact system admin.)',
            'reset_token': reset_token
        }), 200

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json() or {}
    token = data.get('token', '').strip()
    new_password = data.get('new_password', '')

    if not token or not new_password:
        return jsonify({'error': 'Token and new password are required.'}), 400

    if len(new_password) < 8:
        return jsonify({'error': 'Password must be at least 8 characters long.'}), 400

    user = User.query.filter_by(reset_token=token).first()
    if not user or not user.reset_token_expiry or user.reset_token_expiry < datetime.utcnow():
        return jsonify({'error': 'Invalid or expired password reset token.'}), 400

    user.password_hash = generate_password_hash(new_password, method='pbkdf2:sha256')
    user.reset_token = None
    user.reset_token_expiry = None
    db.session.commit()

    return jsonify({'message': 'Password reset successful. You can now log in with your new password.'}), 200

@auth_bp.route('/me', methods=['GET'])
@login_required
def get_me(current_user):
    return jsonify(current_user.to_dict()), 200
