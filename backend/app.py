from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import google.generativeai as genai
import subprocess
import os
from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
import json

load_dotenv()

app = Flask(__name__, static_folder='../frontend/build')
CORS(app)

# Database Configuration
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(BASE_DIR, 'socratic_tutor.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

# Generative AI Configuration
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
generation_config = {
    "temperature": 0.9,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 8192,
}
socratic_system_instruction = """
You are a friendly, supportive teaching assistant specialized in Data Structures and Algorithms. 
You use the Socratic method to teach, which means you ask probing questions to guide the student 
to the answer instead of revealing it directly. Your role is to train the student’s mind to think 
critically, encouraging problem-solving and self-discovery through probing questions. 

When the student asks a question, respond with a single probing question that will lead them 
closer to the answer. Do not provide the answer directly. Instead, guide them step-by-step 
through the thought process. If the student provides an answer to your question, evaluate it 
and ask another probing question to further their understanding.

For debugging and code explanation, follow the same Socratic approach. Ask questions that 
help the student identify errors or understand the code logic step-by-step.
"""
model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
    system_instruction=socratic_system_instruction,
)

# In-memory data (replace with database later)
chat_sessions = {}
progress_data = {}
concept_maps = {
    'sorting': ['bubbleSort', 'quickSort', 'mergeSort'],
    'searching': ['binarySearch'],
    'graph': ['dijkstra']
}

# Student Model
class Student(db.Model):
    student_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    progress_data = db.Column(db.String(500), default='{}')  # Store progress as JSON string

    # New fields for internal tracking:
    completed_topics = db.Column(db.String(500), default='[]')  # JSON list of completed topics
    problems_solved = db.Column(db.String(500), default='{}')  # JSON dict: {topic: count}

    def __repr__(self):
        return f'<Student {self.username}>'

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

# API Routes


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Username and password are required'}), 400

    if Student.query.filter_by(username=username).first():
        return jsonify({'message': 'Username already exists'}), 400

    new_student = Student(username=username)
    new_student.set_password(password)

    db.session.add(new_student)
    db.session.commit()

    return jsonify({'message': 'Student registered successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Username and password are required'}), 400

    student = Student.query.filter_by(username=username).first()

    if student and student.check_password(password):
        # In a real app, you would generate a JWT here
        return jsonify({'message': 'Login successful', 'student_id': student.student_id}), 200
    else:
        return jsonify({'message': 'Invalid username or password'}), 401

@app.route('/student/<int:student_id>', methods=['GET'])
def get_student_data(student_id):
    student = Student.query.get(student_id)
    if student:
        return jsonify({
            'student_id': student.student_id,
            'username': student.username,
            'progress_data': student.progress_data
        }), 200
    else:
        return jsonify({'message': 'Student not found'}), 404


# @app.route('/update_leetcode', methods=['POST'])
# def update_leetcode():
#     data = request.get_json()
#     student_id = data.get('student_id')
#     leetcode_username = data.get('leetcode_username')

#     student = Student.query.get(student_id)
#     if student:
#         student.leetcode_username = leetcode_username
#         db.session.commit()
#         return jsonify({'message': 'LeetCode username updated'}), 200
#     else:
#         return jsonify({'message': 'Student not found'}), 404


@app.route('/sync_progress', methods=['POST'])
def sync_progress():
    data = request.get_json()
    student_id = data.get('student_id')
    #Simulate the LeetCode sync by fetching from frontend
    new_progress = data.get('new_progress') #example  {"Array": 5, "String": 3}
    student = Student.query.get(student_id)
    if student:
        student.progress_data = json.dumps(new_progress)
        db.session.commit()
        return jsonify({'message': 'Progress synced successfully'}), 200
    else:
        return jsonify({'message': 'Student not found'}), 404

# Existing routes (execute, ask, chatbot, visualize, track_progress, get_progress, get_concept_map)
# Define the generate_socratic_question function
def generate_socratic_question(code, error=None, chat_history=None, language='python'):
    if error:
        prompt = f"The following code in {language} has an error:\n{code}\nError: {error}\nAsk a single probing question to help the student debug the code."
    else:
        prompt = f"The following code in {language} is provided:\n{code}\nAsk a single probing question to help the student understand the code or identify potential issues."
    
    if chat_history:
        prompt = f"{chat_history}\n{prompt}"
    
    response = model.generate_content(prompt)
    return response.text.strip()
# Code Execution
def execute_code_in_sandbox(code, language='python'):
    try:
        if language == 'python':
            result = subprocess.run(
                ['python', '-c', code],
                capture_output=True,
                text=True,
                timeout=5
            )
        elif language == 'java':
            with open('Main.java', 'w') as f:
                f.write(code)
            result = subprocess.run(
                ['javac', 'Main.java'],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode == 0:
                result = subprocess.run(
                    ['java', 'Main'],
                    capture_output=True,
                    text=True,
                    timeout=5
                )
        elif language == 'cpp':
            with open('main.cpp', 'w') as f:
                f.write(code)
            result = subprocess.run(
                ['g++', 'main.cpp', '-o', 'main'],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode == 0:
                result = subprocess.run(
                    ['./main.cpp'],
                    capture_output=True,
                    text=True,
                    timeout=5
                )
        elif language == 'javascript':
            with open('script.js', 'w') as f:
                f.write(code)
            result = subprocess.run(
                ['node', 'script.js'],
                capture_output=True,
                text=True,
                timeout=5
            )
        elif language == 'ruby':
            with open('script.rb', 'w') as f:
                f.write(code)
            result = subprocess.run(
                ['ruby', 'script.rb'],
                capture_output=True,
                text=True,
                timeout=5
            )
        else:
            return {"output": "Unsupported language", "error": True}

        if result.returncode != 0:
            return {"output": result.stderr, "error": True}
        return {"output": result.stdout, "error": False}
    except subprocess.TimeoutExpired:
        return {"output": "Error: Code execution timed out.", "error": True}
    except Exception as e:
        return {"output": f"Error: {str(e)}", "error": True}

@app.route('/execute', methods=['POST'])
def execute_code():
    data = request.json
    code = data.get('code')
    language = data.get('language', 'python')
    result = execute_code_in_sandbox(code, language)
    return jsonify(result)

# Socratic Tutoring
@app.route('/ask', methods=['POST'])
def ask_question():
    data = request.json
    user_input = data.get('input')
    error = data.get('error')
    session_id = data.get('session_id')
    language = data.get('language', 'python')
    
    chat_history = chat_sessions.get(session_id, "")
    question = generate_socratic_question(user_input, error, chat_history, language)
    
    chat_sessions[session_id] = f"{chat_history}\nUser: {user_input}\nBot: {question}"
    
    return jsonify({"question": question})

@app.route('/chatbot', methods=['POST'])
def chatbot():
    data = request.json
    user_input = data.get('question')
    session_id = data.get('session_id')
    
    chat_history = chat_sessions.get(session_id, "")
    
    prompt = f"{chat_history}\nUser: {user_input}"
    response = model.generate_content(prompt)
    
    chat_sessions[session_id] = f"{chat_history}\nUser: {user_input}\nBot: {response.text.strip()}"
    
    return jsonify({"response": response.text.strip()})

# Algorithm Visualization
@app.route('/visualize', methods=['POST'])
def visualize_algorithm():
    data = request.json
    algorithm = data.get('algorithm')
    data_list = data.get('data')
    
    if algorithm == 'bubbleSort':
        visualization = bubble_sort(data_list)
    elif algorithm == 'quickSort':
        visualization = quick_sort(data_list)
    elif algorithm == 'mergeSort':
        visualization = merge_sort(data_list)
    elif algorithm == 'dijkstra':
        visualization = dijkstra(data_list)
    elif algorithm == 'binarySearch':
        visualization = binary_search(data_list)
    elif algorithm == 'linearSearch':
        visualization = linear_search(data_list)
    else:
        return jsonify({"error": "Unsupported algorithm"})
    
    return jsonify({"visualization": visualization})

def bubble_sort(data):
    steps = []
    n = len(data)
    for i in range(n):
        for j in range(0, n-i-1):
            if data[j] > data[j+1]:
                data[j], data[j+1] = data[j+1], data[j]
                steps.append(data.copy())
    return steps

def quick_sort(data):
    steps = []
    def _quick_sort(arr):
        if len(arr) <= 1:
            return arr
        pivot = arr[len(arr) // 2]
        left = [x for x in arr if x < pivot]
        middle = [x for x in arr if x == pivot]
        right = [x for x in arr if x > pivot]
        steps.append(left + middle + right)
        return _quick_sort(left) + middle + _quick_sort(right)
    _quick_sort(data)
    return steps

def merge_sort(data):
    steps = []
    def _merge_sort(arr):
        if len(arr) <= 1:
            return arr
        mid = len(arr) // 2
        left = _merge_sort(arr[:mid])
        right = _merge_sort(arr[mid:])
        merged = merge(left, right)
        steps.append(merged)
        return merged
    def merge(left, right):
        result = []
        i = j = 0
        while i < len(left) and j < len(right):
            if left[i] < right[j]:
                result.append(left[i])
                i += 1
            else:
                result.append(right[j])
                j += 1
        result.extend(left[i:])
        result.extend(right[j:])
        return result
    _merge_sort(data)
    return steps

def dijkstra(graph):
    # Placeholder for Dijkstra's Algorithm
    steps = []
    # Implement Dijkstra's Algorithm here
    return steps

def binary_search(arr):
    # Placeholder for Binary Search
    steps = []
    # Implement Binary Search here
    return steps
def dfs_iterative(graph, start):
    visited = set()  # Set to keep track of visited nodes
    stack = [start]  # Stack to keep track of nodes to visit
    
    while stack:
        node = stack.pop()  # Pop the last node from the stack
        
        if node not in visited:
            print(node)  # Process the node (e.g., print it)
            visited.add(node)  # Mark it as visited
            
            # Add all unvisited neighbors to the stack
            for neighbor in graph[node]:
                if neighbor not in visited:
                    stack.append(neighbor)

def linear_search(arr,target):
    steps=[]
    for i in range(len(arr)):
        if arr[i]==target:
            steps.append(i)
    return steps


# Progress Tracking
# ... (previous code)

@app.route('/mark_topic_completed', methods=['POST'])
def mark_topic_completed():
    data = request.get_json()
    student_id = data.get('student_id')
    topic = data.get('topic')

    student = Student.query.get(student_id)
    if not student:
        return jsonify({'message': 'Student not found'}), 404

    try:
        completed_topics = json.loads(student.completed_topics) if student.completed_topics else []
    except json.JSONDecodeError:
        completed_topics = []

    if topic not in completed_topics:
        completed_topics.append(topic)
        student.completed_topics = json.dumps(completed_topics)
        db.session.commit()
        return jsonify({'message': f'Topic "{topic}" marked as completed'}), 200
    else:
        return jsonify({'message': f'Topic "{topic}" was already marked as completed'}), 200

# ... (rest of the code)
    
@app.route('/record_problems_solved', methods=['POST'])
def record_problems_solved():
    data = request.get_json()
    student_id = data.get('student_id')
    topic = data.get('topic')
    count = data.get('count')

    student = Student.query.get(student_id)
    if not student:
        return jsonify({'message': 'Student not found'}), 404

    try:
        problems_solved = json.loads(student.problems_solved) if student.problems_solved else {}
    except json.JSONDecodeError:
        problems_solved = {}

    problems_solved[topic] = count
    student.problems_solved = json.dumps(problems_solved)
    db.session.commit()
    return jsonify({'message': f'Problems solved in "{topic}" updated to {count}'}), 200


@app.route('/track_progress', methods=['POST'])
def track_progress():
    data = request.json
    student_id = data.get('student_id')
    progress = data.get('progress')
    
    if student_id not in progress_data:
        progress_data[student_id] = []
    
    progress_data[student_id].append(progress)
    
    return jsonify({"status": "success"})

@app.route('/get_progress', methods=['GET'])
def get_progress():
    student_id = request.args.get('student_id')
    student = Student.query.get(student_id)
    
    if student:
        # Fetch completed topics
        completed_topics = json.loads(student.completed_topics) if student.completed_topics else []
        # Fetch problems solved
        problems_solved = json.loads(student.problems_solved) if student.problems_solved else {}
        
        # Format progress data
        progress = []
        for topic in completed_topics:
            progress.append(f"Completed {topic}")
        for topic, count in problems_solved.items():
            progress.append(f"Solved {count} problems in {topic}")
        
        return jsonify({"progress": progress})
    else:
        return jsonify({"progress": []})

# Concept Mapping
@app.route('/get_concept_map', methods=['GET'])
def get_concept_map():
    return jsonify(concept_maps)

# Serve React App
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000)