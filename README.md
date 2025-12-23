Prerequisites
Python 3.7 or higher

pip (Python package manager)

Modern web browser

Installation
Clone the repository

bash
git clone https://github.com/yourusername/personal-notes-system.git
cd personal-notes-system
Set up the backend

bash
cd backend
pip install -r requirements.txt
Start the server

bash
python app.py
Access the application

Open your browser and go to http://localhost:5000

Or simply open frontend/index.html directly

🔧 API Documentation
Base URL
text
http://localhost:5000/api
Endpoints
Method	Endpoint	Description
GET	/notes	Get all notes
POST	/notes	Create a new note
PUT	/notes/{id}	Update a note
DELETE	/notes/{id}	Delete a note
Example Requests
Create a new note:

bash
curl -X POST http://localhost:5000/api/notes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Meeting Notes",
    "content": "Discussed project timeline",
    "status": "important"
  }'
Get all notes:

bash
curl http://localhost:5000/api/notes
💻 Development
Frontend Development
The frontend is built with vanilla HTML, CSS, and JavaScript. To modify:

Edit files in the frontend/ directory

No build process required - changes are immediate

Backend Development
The backend uses Flask. Key files:

backend/app.py: Main Flask application

backend/notes.json: Data storage (auto-generated)

To add new features:

Add new routes in app.py

Update frontend JavaScript to use new endpoints

Test with Postman or curl

Running in Development Mode
bash
cd backend
export FLASK_ENV=development
python app.py
🧪 Testing
Manual Testing
Create notes: Click "New Note" and type content

Edit notes: Click existing notes and modify

Search: Type in search box to filter notes

Change status: Click tag button to cycle statuses

Switch language: Click language buttons

API Testing
Use curl or Postman to test API endpoints:

bash
# Test API health
curl http://localhost:5000/health

# Test notes endpoint
curl http://localhost:5000/api/notes
📱 Usage Guide
Creating Notes
Click "New Note" button

Enter title in the top field

Type content in the main editor

Note saves automatically as you type

Organizing Notes
Search: Use the search box to find notes

Status Tags: Click the tag button to mark as Important or Completed

Sorting: Notes are automatically sorted by last edit time

Language Switching
Click the language buttons in the top right corner to switch between English and Chinese interfaces.

🔌 Integration
Importing Notes
Currently, notes can be imported by:

Modifying the notes.json file directly

Using the API endpoints programmatically

Exporting Notes
Notes are stored in backend/notes.json in human-readable JSON format, making it easy to:

Backup your notes

Transfer to another system

Process with other tools

🤝 Contributing
We welcome contributions! Here's how you can help:

Fork the repository

Create a feature branch

bash
git checkout -b feature/amazing-feature
Make your changes

Test your changes

Commit your changes

bash
git commit -m 'Add amazing feature'
Push to the branch

bash
git push origin feature/amazing-feature
Open a Pull Request

Areas for Contribution
Add Markdown support

Implement categories/folders

Add note sharing features

Improve mobile responsiveness

Add dark mode

Implement note export (PDF, Word)

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments
Flask Team for the amazing web framework

Material Icons for the beautiful icon set

All Contributors who have helped improve this project
