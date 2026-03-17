import os
import requests
from flask import Flask, redirect, url_for, session, jsonify, render_template, send_from_directory, request
from authlib.integrations.flask_client import OAuth
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from datetime import timedelta

app = Flask(__name__,
            static_folder='../frontend/dist',
            template_folder='../frontend/public/ui-code/templates')

app.secret_key = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')

app.config.update(
    SESSION_COOKIE_SECURE=False,      # Set to True if using HTTPS in production
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Lax',
    SESSION_REFRESH_EACH_REQUEST=True,
    PERMANENT_SESSION_LIFETIME=timedelta(hours=1)
)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login_page'

class User(UserMixin):
    def __init__(self, id, name, email, picture):
        self.id = id
        self.name = name
        self.email = email
        self.picture = picture

@login_manager.user_loader
def load_user(user_id):
    user_data = session.get('user')
    if user_data and user_data.get('id') == user_id:
        return User(user_data['id'], user_data['name'], user_data['email'], user_data['picture'])
    return None

oauth = OAuth(app)

# ---------- Google OAuth ----------
google = oauth.register(
    name='google',
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)

# ---------- Microsoft OAuth ----------
microsoft = oauth.register(
    name='microsoft',
    client_id=os.getenv("MICROSOFT_CLIENT_ID"),
    client_secret=os.getenv("MICROSOFT_CLIENT_SECRET"),
    authorize_url='https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    access_token_url='https://login.microsoftonline.com/common/oauth2/v2.0/token',
    client_kwargs={'scope': 'openid profile email'}
)

# ---------- Static assets ----------
@app.route('/static/<path:filename>')
def serve_legacy_static(filename):
    return send_from_directory('../frontend/public/ui-code/static', filename)

@app.route('/react-static/<path:filename>')
def serve_react_static(filename):
    return send_from_directory(app.static_folder, filename)

# ---------- Public routes ----------
@app.route('/')
def root():
    return render_template('login.html')

@app.route('/login')
def login_page():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    return render_template('login.html')

# ---------- Google Login ----------
@app.route('/auth/login')
def auth_login():
    redirect_uri = url_for('auth_callback', _external=True)
    return google.authorize_redirect(redirect_uri)

@app.route('/auth/callback')
def auth_callback():
    token = google.authorize_access_token()
    nonce = session.pop('_authlib_google_nonce', None) or session.pop('nonce', None)
    user_info = google.parse_id_token(token, nonce=nonce)
    email = user_info['email']
    if not email.endswith('@saturam.com'):
        return "Access denied: only @saturam.com emails are allowed.", 403
    user = User(id=email, name=user_info['name'], email=email, picture=user_info.get('picture', ''))
    login_user(user)
    session['user'] = {'id': email, 'name': user_info['name'], 'email': email, 'picture': user_info.get('picture', '')}
    session.permanent = True
    return redirect(url_for('index'))

# ---------- Microsoft Login ----------
@app.route('/auth/microsoft/login')
def microsoft_login():
    redirect_uri = url_for('microsoft_callback', _external=True)
    return microsoft.authorize_redirect(redirect_uri)

@app.route('/auth/microsoft/callback')
def microsoft_callback():

    code = request.args.get("code")

    if not code:
        return "Authorization failed: no code returned", 400

    token_url = "https://login.microsoftonline.com/common/oauth2/v2.0/token"

    data = {
        "client_id": os.getenv("MICROSOFT_CLIENT_ID"),
        "client_secret": os.getenv("MICROSOFT_CLIENT_SECRET"),
        "code": code,
        "redirect_uri": url_for('microsoft_callback', _external=True),
        "grant_type": "authorization_code"
    }

    token_resp = requests.post(token_url, data=data)

    if token_resp.status_code != 200:
        return f"Token exchange failed: {token_resp.text}", 400

    token_data = token_resp.json()
    access_token = token_data.get("access_token")

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    user_resp = requests.get(
        "https://graph.microsoft.com/oidc/userinfo",
        headers=headers
    )

    if user_resp.status_code != 200:
        return f"Failed to get user info: {user_resp.text}", 400

    user_info = user_resp.json()

    email = user_info.get("email") or user_info.get("preferred_username")
    name = user_info.get("name", email.split("@")[0] if email else "Microsoft User")

    user = User(
        id=email,
        name=name,
        email=email,
        picture=user_info.get("picture", "")
    )

    login_user(user)

    session["user"] = {
        "id": email,
        "name": name,
        "email": email,
        "picture": user_info.get("picture", "")
    }

    session.permanent = True

    return redirect(url_for("index"))


# ---------- Dev login (optional) ----------
@app.route('/auth/dev-login')
def dev_login():
    test_user = User(id='dev@example.com', name='Dev User', email='dev@example.com', picture='')
    login_user(test_user, remember=True)
    session['user'] = {'id': 'dev@example.com', 'name': 'Dev User', 'email': 'dev@example.com', 'picture': ''}
    session.permanent = True
    return redirect(url_for('index'))

@app.route('/auth/logout')
@login_required
def auth_logout():
    logout_user()
    session.clear()
    return redirect(url_for('login_page'))

@app.route('/auth/me')
@login_required
def auth_me():
    return jsonify({
        'id': current_user.id,
        'name': current_user.name,
        'email': current_user.email,
        'picture': current_user.picture
    })

# ---------- Protected legacy pages ----------
@app.route('/connectors')
@login_required
def connectors():
    return send_from_directory(app.template_folder, 'connectors.html')

@app.route('/connection-status')
@login_required
def connection_status():
    return send_from_directory(app.template_folder, 'connection-status.html')

@app.route('/available-destination')
@login_required
def available_destination():
    return send_from_directory(app.template_folder, 'available-destination.html')

@app.route('/index')
@login_required
def index():
    return send_from_directory(app.template_folder, 'index.html')

@app.route('/connectors.html')
@login_required
def connectors_html():
    return connectors()

@app.route('/connection-status.html')
@login_required
def connection_status_html():
    return connection_status()

@app.route('/available-destination.html')
@login_required
def available_destination_html():
    return available_destination()

@app.route('/index.html')
@login_required
def index_html():
    return index()

@app.route('/home')
@login_required
def home():
    return redirect(url_for('index'))

# ---------- React catch-all ----------
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
@login_required
def serve_react_app(path):
    if path in ('connectors', 'connection-status', 'available-destination', 'index',
                'connectors.html', 'connection-status.html', 'available-destination.html', 'index.html',
                'login', 'static', 'auth', 'react-static', 'home'):
        return "Not Found", 404
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=5000)