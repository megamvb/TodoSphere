import os
from flask import Flask, request, jsonify, render_template, redirect, url_for, flash
from flask_login import LoginManager, login_user, login_required, logout_user, current_user
from flask_bcrypt import Bcrypt
from database import db
from models import User, Todo, Category
from datetime import datetime
from sqlalchemy import or_

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
app.config['SECRET_KEY'] = os.urandom(24)  # Set a secret key for session management
db.init_app(app)

bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))

@app.route('/')
@login_required
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user = User.query.filter_by(username=username).first()
        if user and bcrypt.check_password_hash(user.password, password):
            login_user(user)
            return redirect(url_for('index'))
        flash('Invalid username or password')
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        existing_user = User.query.filter((User.username == username) | (User.email == email)).first()
        if existing_user:
            flash('Username or email already exists')
        else:
            hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
            new_user = User(username=username, email=email, password=hashed_password)
            db.session.add(new_user)
            db.session.commit()
            login_user(new_user)
            flash('Registration successful!')
            return redirect(url_for('index'))
    return render_template('register.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        new_password = request.form.get('new_password')

        existing_user = User.query.filter(
            ((User.username == username) | (User.email == email)) &
            (User.id != current_user.id)
        ).first()

        if existing_user:
            flash('Username or email already exists')
        else:
            current_user.username = username
            current_user.email = email
            if new_password:
                current_user.password = bcrypt.generate_password_hash(new_password).decode('utf-8')
            db.session.commit()
            flash('Profile updated successfully')
            return redirect(url_for('profile'))

    return render_template('profile.html')

# ... (rest of the code remains unchanged)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Create all tables
    app.run(host='0.0.0.0', port=5000)
