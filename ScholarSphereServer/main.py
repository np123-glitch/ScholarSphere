# main.py

from flask import Flask, render_template, request, redirect, url_for, jsonify, send_from_directory
import os
import subprocess
import shutil
from gen_response import send_message
from pinecone import Pinecone
from flask_cors import CORS
import jwt
from functools import wraps
from datetime import datetime, timedelta
import threading
import json
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from pypdf import PdfReader

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, allow_headers=["Authorization", "Content-Type"])

SECRET_KEY = "pcsk_5qb5ow_MWbqVcwCeNKyi1uwpR1kqgoimWpkV2JeUgzE8ouUCMvozvPcW1fRy3aBPeLnk54"

pc = Pinecone(api_key="pcsk_3eNXoj_2fMMzVFpuLpaz414Ua5hcJrDiBiN3iywg2eW4rejonebqZGkqGh86QaPM4p1522")
assistant = pc.assistant.Assistant(assistant_name="official-assistant")

USERS_FILE = 'users.json'
if not os.path.exists(USERS_FILE):
    with open(USERS_FILE, 'w') as f:
        json.dump({}, f)

def upload(file_name, assistant, userid):
    response = assistant.upload_file(
        file_path=file_name,
        metadata={"userid": userid},
        timeout=None,
    )
    return response

def load_users():
    with open(USERS_FILE, 'r') as f:
        return json.load(f)

def save_users(users):
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=4)

def add_user(username, email, password, realname, roles=["user"]):
    users = load_users()
    if username in users:
        raise ValueError("Username already exists")
    
    hashed_password = generate_password_hash(password)
    users[username] = {
        "password": hashed_password,
        "email": email,
        "roles": roles,
        "realname": realname,
    }
    save_users(users)

def verify_user(username, password):
    users = load_users()
    user = users.get(username)
    if not user:
        return False
    return check_password_hash(user['password'], password)

def remove_non_utf8(text):
    return text.encode("utf-8", "ignore").decode("utf-8")

def process_pdf(filename):
    output_dir = "./output"
    os.makedirs(output_dir, exist_ok=True)
    text = ""
    try:
        subprocess.run(["pdftoppm", filename, os.path.join(output_dir, 'page'), '-png'], check=True)
        output_files = os.listdir(output_dir)
        output_files.sort()
        
        for file in output_files:
            if file.endswith(".png"):
                temp_image_path = os.path.join(output_dir, file)
                temp_output = os.path.join(output_dir, f"temp_output_{file}")
                subprocess.run(['tesseract', temp_image_path, temp_output, '--psm', '6'], check=True)

                with open(temp_output + ".txt", "r", encoding="utf-8", errors="replace") as f:
                    text += f.read() + "\n"
    except subprocess.CalledProcessError as e:
        print(f"An error occurred while processing the pages: {e}")
    
    text = remove_non_utf8(text)
    output_text_file = os.path.join(output_dir, "output1.txt")
    with open(output_text_file, "w", encoding="utf-8") as f:
        f.write(text)
    print(output_text_file)
    return output_text_file

def process_file(filepath, file_type):
    return process_pdf(filepath)

def list_files(username):
    return assistant.list_files(fiter=username)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            parts = auth_header.split()
            if len(parts) == 2 and parts[0] == 'Bearer':
                token = parts[1]

        if not token:
            print('Token is missing!')
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            print(token)
            current_user = data['sub']
        except jwt.ExpiredSignatureError:
            print('Token has expired!')
            return jsonify({'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            print('Invalid token!')
            print(token)
            return jsonify({'message': 'Invalid token!'}), 401

        return f(current_user, *args, **kwargs)
    return decorated

def process_and_upload(filepath, assistant, current_user):
    transcription_path = None
    try:
        processed_output = process_pdf(filepath)
        response = upload(processed_output, assistant, current_user)
        print(response)
        print(f"PDF file {filepath} processed and uploaded successfully.")
    except Exception as e:
        print(f"An error occurred while processing the file {filepath}: {e}")
    finally:
        try:
            shutil.rmtree('./output')
        except Exception as cleanup_error:
            print(f"Error during cleanup for {filepath}: {cleanup_error}")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
@token_required
def upload_file(current_user):
    """
    POST /upload
    Uploads a file from the user 'current_user'.
    Stores the file in uploads/<current_user>/
    """
    if request.method == 'POST':
        file = request.files.get('file')
        if not file:
            return jsonify({'error': 'No file part in the request'}), 400

        filename = secure_filename(file.filename)
        try:
            user_upload_dir = os.path.join('./uploads', current_user)
            os.makedirs(user_upload_dir, exist_ok=True)

            filepath = os.path.join(user_upload_dir, filename)
            file.save(filepath)
            print(f"File saved to {filepath}")

            # Start background thread for PDF processing
            thread = threading.Thread(
                target=process_and_upload,
                args=(filepath, assistant, current_user),
                daemon=True
            )
            thread.start()
            print(f"Started background thread for {filepath}")

            return jsonify({
                'message': 'File received and is being processed.',
                'path': filepath
            }), 200
        except Exception as e:
            print(f"An error occurred during file upload: {e}")
            return jsonify({'error': 'An error occurred while uploading the file.'}), 500

    return jsonify({'error': 'Invalid request method'}), 405

@app.route('/chat', methods=['POST'])
@token_required
def chat(current_user):
    if request.method == 'POST':
        data = request.get_json()
        user_message = data.get('message', '')
        prompt = f"You are a helpful assistant. A user said: '{user_message}'. Please respond to the user's message directly. If you don't have a reference for the answer, say 'I don't know the answer to that question.'"
        bot_response = send_message(prompt, assistant, current_user)
        return jsonify({'response': bot_response}), 200

    return jsonify({'error': 'Invalid request method'}), 405

@app.route('/auth/login', methods=['POST'])
def login():
    if request.method == 'POST':
        data = request.get_json()
        loginId = data.get('loginId', '')
        password = data.get('password', '')

        if not verify_user(loginId, password):
            print('Invalid login credentials!')
            return jsonify({'message': 'Invalid login credentials!'}), 401

        users = load_users()
        user = users.get(loginId)

        token_payload = {
            'iss': 'https://scholarsphere.anythingnew.today',
            'sub': loginId,
            'exp': datetime.utcnow() + timedelta(hours=1),
            'iat': datetime.utcnow(),
            'jti': os.urandom(16).hex(),
            'name': user['realname'],
        }

        token = jwt.encode(token_payload, SECRET_KEY, algorithm='HS256')
        return jsonify({'token': token}), 200

    return jsonify({'message': 'Invalid request method'}), 405

@app.route('/auth/signup', methods=['POST'])
def signup():
    if request.method == 'POST':
        data = request.get_json()
        username = data.get('username', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '').strip()
        realname = data.get('realname', '').strip()

        if not all([username, email, password, realname]):
            return jsonify({'message': 'All fields are required!'}), 400

        try:
            add_user(username, email, password, realname)
            return jsonify({'message': 'User registered successfully!'}), 201
        except ValueError as ve:
            return jsonify({'message': str(ve)}), 400
        except Exception as e:
            print(f"An error occurred during signup: {e}")
            return jsonify({'message': 'An error occurred during signup.'}), 500

    return jsonify({'message': 'Invalid request method'}), 405

@app.route('/feedback', methods=['POST'])
@token_required
def feedback(current_user):
    if request.method == 'POST':
        data = request.get_json()
        feedback_text = data.get('feedback', '')

        with open('feedback.txt', 'a') as f:
            f.write(f"Feedback from {current_user}: '{feedback_text}' at {datetime.now()}\n")

        return jsonify({'message': 'Feedback received'}), 200

    return jsonify({'error': 'Invalid request method'}), 405

@app.route('/files/<username>', methods=['GET'])
@token_required
def list_user_files(current_user, username):
    if username != current_user:
        return jsonify({"error": "Unauthorized"}), 403

    user_upload_dir = os.path.join('./uploads', username)
    if not os.path.exists(user_upload_dir):
        return jsonify([]), 200

    file_list = []
    for fname in os.listdir(user_upload_dir):
        file_url = f"http://scholarsphere.anythingnew.today/files/{username}/{fname}"
        file_list.append({
            "fileName": fname,
            "url": file_url
        })

    return jsonify(file_list), 200

@app.route('/assistant-files/<username>', methods=['GET'])
@token_required
def get_assistant_files(current_user, username):
    """
    GET /assistant-files/<username>
    Returns a JSON list of all files for the given username, along with status, etc.
    """
    if username != current_user:
        return jsonify({"error": "Unauthorized"}), 403

    try:
        # Use Pinecone assistant to retrieve files for this user
        files = assistant.list_files(filter={"userid": username})

        # Convert FileModel objects to simple dicts
        file_list = []
        for f in files:
            file_list.append({
                "name": f.name,
                "id": f.id,
                "metadata": f.metadata,
                "created_on": f.created_on,
                "updated_on": f.updated_on,
                "status": f.status,
                "percent_done": f.percent_done,
                "signed_url": f.signed_url,
                "error_message": f.error_message,
                "size": f.size
            })

        return jsonify(file_list), 200

    except Exception as e:
        print(f"Error retrieving assistant files: {e}")
        return jsonify({"error": "Could not retrieve files"}), 500


@app.route('/files/<username>/<path:filename>', methods=['GET'])
def serve_file(username, filename):

    user_upload_dir = os.path.join('./uploads', username)
    target_path = os.path.join(user_upload_dir, filename)

    if not os.path.exists(target_path):
        return jsonify({"error": "File not found"}), 404

    # Serves the file from the directory
    return send_from_directory(user_upload_dir, filename, as_attachment=False)

if __name__ == "__main__":
    # For local dev, might switch to your server’s IP
    app.run(debug=True, host='0.0.0.0', port=5000)
 