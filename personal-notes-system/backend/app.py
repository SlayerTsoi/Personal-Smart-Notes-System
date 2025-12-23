from flask import Flask, Response, request, send_from_directory
from flask_cors import CORS
import json
import os
from datetime import datetime
import uuid

def create_app():
    """Creating a Flask Application"""
    # Get the project root directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(current_dir)
    
    app = Flask(__name__, 
                static_folder=os.path.join(project_root, 'frontend'),
                static_url_path='')
    
    # Enable CORS
    CORS(app)
    
    # Data file path
    NOTES_FILE = os.path.join(current_dir, 'notes.json')
    
    # ==================== utility functions ====================
    
    def json_response(data, status_code=200):
        """Create a JSON response to ensure Chinese characters are displayed correctly."""
        return Response(
            json.dumps(data, ensure_ascii=False),
            status=status_code,
            mimetype='application/json; charset=utf-8'
        )
    
    def load_notes():
        """Loading note data"""
        if not os.path.exists(NOTES_FILE):
            # Create sample data
            sample_notes = [
                {
                    "id": str(uuid.uuid4()),
                    "title": "项目会议记录",
                    "content": "讨论了新功能的开发计划，确定了时间表和负责人。需要在下周五前完成原型设计。",
                    "lastEdited": datetime.now().isoformat(),
                    "status": "important"
                },
                {
                    "id": str(uuid.uuid4()),
                    "title": "读书笔记 - 《深度工作》",
                    "content": "深度工作是指在无干扰的状态下专注进行职业活动，使个人的认知能力达到极限。这种努力能够创造新价值，提升技能，而且难以复制。",
                    "lastEdited": datetime.now().isoformat(),
                    "status": "normal"
                },
                {
                    "id": str(uuid.uuid4()),
                    "title": "购物清单",
                    "content": "- 牛奶\n- 鸡蛋\n- 面包\n- 水果\n- 蔬菜",
                    "lastEdited": datetime.now().isoformat(),
                    "status": "completed"
                },
                {
                    "id": str(uuid.uuid4()),
                    "title": "学习计划",
                    "content": "1. 完成JavaScript高级课程\n2. 学习React框架\n3. 准备前端面试题\n4. 构建个人项目",
                    "lastEdited": datetime.now().isoformat(),
                    "status": "normal"
                }
            ]
            save_notes(sample_notes)
            return sample_notes
        
        try:
            with open(NOTES_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Failed to load note data: {e}")
            return []
    
    def save_notes(notes):
        """Save Notes Data"""
        try:
            with open(NOTES_FILE, 'w', encoding='utf-8') as f:
                json.dump(notes, f, ensure_ascii=False, indent=2)
            return True
        except Exception as e:
            print(f"Failed to save note data: {e}")
            return False
    
    # ==================== Front-end routing ====================
    
    @app.route('/')
    def serve_frontend():
        """Provide front-end pages"""
        try:
            # Return directly to the front-end directory index.html
            frontend_dir = os.path.join(project_root, 'frontend')
            return send_from_directory(frontend_dir, 'index.html')
        except Exception as e:
            return json_response({"error": f"Unable to load front-end page: {str(e)}"}, 500)
    
    @app.route('/<path:filename>')
    def serve_static(filename):
        """Provide static files"""
        try:
            frontend_dir = os.path.join(project_root, 'frontend')
            return send_from_directory(frontend_dir, filename)
        except:
            return json_response({"error": "file not found"}, 404)
    
    # ==================== API路由 ====================
    
    @app.route('/api/notes', methods=['GET'])
    def get_notes():
        """Get all notes"""
        try:
            notes = load_notes()
            return json_response(notes)
        except Exception as e:
            return json_response({"error": f"Failed to retrieve notes: {str(e)}"}, 500)
    
    @app.route('/api/notes', methods=['POST'])
    def create_note():
        """Create a new note"""
        try:
            data = request.get_json()
            
            if not data or 'title' not in data:
                return json_response({"error": "Note titles cannot be empty."}, 400)
            
            notes = load_notes()
            
            new_note = {
                "id": str(uuid.uuid4()),
                "title": data.get('title', ''),
                "content": data.get('content', ''),
                "lastEdited": datetime.now().isoformat(),
                "status": data.get('status', 'normal')
            }
            
            notes.append(new_note)
            
            if save_notes(notes):
                return json_response(new_note, 201)
            else:
                return json_response({"error": "Notes failed to save"}, 500)
        except Exception as e:
            return json_response({"error": f"Note creation failed: {str(e)}"}, 500)
    
    @app.route('/api/notes/<note_id>', methods=['PUT'])
    def update_note(note_id):
        """Update Notes"""
        try:
            data = request.get_json()
            
            if not data or 'title' not in data:
                return json_response({"error": "Note titles cannot be empty."}, 400)
            
            notes = load_notes()
            
            # Finding Notes
            note_index = None
            for i, note in enumerate(notes):
                if note['id'] == note_id:
                    note_index = i
                    break
            
            if note_index is None:
                return json_response({"error": "Notes do not exist"}, 404)
            
            # Update Notes
            notes[note_index] = {
                **notes[note_index],
                "title": data.get('title', ''),
                "content": data.get('content', ''),
                "lastEdited": datetime.now().isoformat(),
                "status": data.get('status', notes[note_index]['status'])
            }
            
            if save_notes(notes):
                return json_response(notes[note_index])
            else:
                return json_response({"error": "Notes update failed"}, 500)
        except Exception as e:
            return json_response({"error": f"Notes update failed: {str(e)}"}, 500)
    
    @app.route('/api/notes/<note_id>', methods=['DELETE'])
    def delete_note(note_id):
        """Delete notes"""
        try:
            notes = load_notes()
            
            # Finding Notes
            original_length = len(notes)
            notes = [note for note in notes if note['id'] != note_id]
            
            if len(notes) == original_length:
                return json_response({"error": "Notes do not exist"}, 404)
            
            if save_notes(notes):
                return json_response({"message": "Notes deleted successfully"})
            else:
                return json_response({"error": "Deleting notes failed"}, 500)
        except Exception as e:
            return json_response({"error": f"Deleting notes failed: {str(e)}"}, 500)
    
    # ==================== Health check ====================
    
    @app.route('/health')
    def health_check():
        """Health check endpoint"""
        return json_response({
            "status": "healthy",
            "service": "Personal smart note-taking system",
            "timestamp": datetime.now().isoformat()
        })
    
    # ==================== API documentation ====================
    
    @app.route('/api')
    def api_docs():
        """API documentation"""
        return json_response({
            "message": "个人智能笔记系统 API",
            "endpoints": {
                "GET /api/notes": "Get all notes",
                "POST /api/notes": "Create a new note",
                "PUT /api/notes/<id>": "Update Notes",
                "DELETE /api/notes/<id>": "Delete notes",
                "GET /health": "Health check"
            }
        })
    
    return app

if __name__ == '__main__':
    app = create_app()
    print("=" * 60)
    print("Personal smart note-taking system - Backend server")
    print("=" * 60)
    print("\n Access address:")
    print("  • Front-end page: http://localhost:5000")
    print("  • API documentation: http://localhost:5000/api")
    print("  • Health check: http://localhost:5000/health")
    print("\nAPI endpoints:")
    print("  • GET    /api/notes       - Get all notes")
    print("  • POST   /api/notes       - Create a new note")
    print("  • PUT    /api/notes/<id>  - Update Notes")
    print("  • DELETE /api/notes/<id>  - Delete notes")
    print("\nInstructions for use:")
    print("  1. Access http://localhost:5000 Using a note-taking system")
    print("  2. Or open directly frontend/index.html document")
    print("  3. Press Ctrl+C Stop the server")
    print("=" * 60)
    
    # Start the server
    app.run(debug=True, port=5000, host='0.0.0.0')