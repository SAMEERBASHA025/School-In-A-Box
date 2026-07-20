# 🎓 School-In-A-Box

An AI-powered digital learning platform built to enhance the educational experience for students, teachers, and administrators. The platform combines AI-assisted learning, study material management, quizzes, attendance tracking, and analytics in a modern web application.

---

## 📌 Overview

School-In-A-Box is a full-stack Learning Management System (LMS) designed for educational institutions. It provides secure role-based access for Students, Teachers, and Administrators while integrating AI-powered learning tools to improve study efficiency.

The platform enables students to upload study materials, interact with an AI tutor, take quizzes, track learning progress, and receive personalized recommendations. Teachers can upload learning resources, manage quizzes, monitor attendance, and analyze student performance.

---
# 🌐 Live Demo

### 🖥️ Frontend
https://school-in-a-box-mpsv.vercel.app

### ⚙️ Backend API
https://school-in-a-box-1.onrender.com

### 📖 API Documentation
https://school-in-a-box-1.onrender.com/docs

### 💻 GitHub Repository
https://github.com/SAMEERBASHA025/School-In-A-Box

# ✨ Features

## 👨‍🎓 Student

- Secure Login & Registration
- JWT Authentication
- Upload PDF Study Materials
- AI Chat with Uploaded Notes (RAG)
- AI PDF Summarization
- AI Generated Study Notes
- Online Quiz System
- Quiz Results & Analytics
- Attendance Tracking
- Learning Progress Dashboard
- Study Material Library
- Download Notes
- Responsive Dashboard
- Dark & Light Theme

---

## 👨‍🏫 Teacher

- Secure Teacher Login
- Upload Study Materials
- Manage Notes
- Create & Manage Quizzes
- View Student Performance
- Attendance Monitoring
- Dashboard Analytics
- Publish Learning Resources

---

## 👨‍💼 Admin

- Manage Students
- Manage Teachers
- Dashboard Analytics
- User Management
- Reports
- System Monitoring

---

# 🤖 AI Features

- AI Chat with Uploaded PDFs
- Retrieval-Augmented Generation (RAG)
- PDF Text Extraction
- Semantic Search using ChromaDB
- AI Study Assistant
- AI Notes Generation
- Local Embedding Search
- OpenAI GPT Integration
- Offline AI Fallback Mode

---

# 🛠 Tech Stack

## Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- Framer Motion
- Recharts
- React Markdown
- Lucide React Icons

---

## Backend

- FastAPI
- Python 3.12
- SQLAlchemy
- SQLite
- PostgreSQL (Production)
- JWT Authentication
- Passlib
- bcrypt
- Pydantic
- Uvicorn
- python-multipart

---

## AI Stack

- LangChain
- OpenAI GPT
- ChromaDB
- Sentence Transformers
- PyPDF
- RAG Pipeline

---

# 📁 Project Structure

```text
School-In-A-Box
│
├── frontend
│   ├── src
│   ├── public
│   ├── package.json
│   └── vite.config.ts
│
├── backend
│   ├── routers
│   ├── services
│   ├── uploads
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── auth.py
│   ├── crud.py
│   ├── main.py
│   └── requirements.txt
│
└── README.md
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/your-username/School-In-A-Box.git
cd School-In-A-Box
```

---

# Backend Setup

```bash
cd backend

python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

### Linux / macOS

```bash
source venv/bin/activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Run backend

```bash
uvicorn main:app --reload
```

Backend URL

```
http://127.0.0.1:8000
```

Swagger API

```
http://127.0.0.1:8000/docs
```

---

# Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend URL

```
http://localhost:5173
```

---

# Environment Variables

Create a `.env` file inside the backend folder.

```env
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

OPENAI_API_KEY=your_openai_api_key
```

---

# Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Student | student@school.com | password |
| Teacher | teacher@school.com | password |
| Admin | admin@school.com | password |

---

# AI Workflow

```
Upload PDF
      │
      ▼
Extract Text
      │
      ▼
Split into Chunks
      │
      ▼
Generate Embeddings
      │
      ▼
Store in ChromaDB
      │
      ▼
Student asks Question
      │
      ▼
Retrieve Relevant Chunks
      │
      ▼
Generate AI Response
```

---

# API Endpoints

## Authentication

```
POST /register
POST /login
GET /profile
```

## Notes

```
POST /upload
GET /notes
DELETE /notes/{id}
```

## AI

```
POST /chat
```

## Quiz

```
POST /quiz
GET /quiz
POST /submit
```

---

# Future Enhancements

- AI Video-to-Notes
- AI Audio-to-Notes
- Live Classes
- Video Conferencing
- Assignment Submission
- AI Flashcards
- AI Quiz Generator
- AI Study Planner
- Push Notifications
- Mobile Application

---

# Deployment

Frontend

- Vercel

Backend

- Render

Database

- PostgreSQL (Supabase)

---

# Author

**Nandavarapu Sameer Basha**

B.Tech Computer Science and Engineering (IoT)

SRM Institute of Science and Technology

---

# License

This project is developed for academic and educational purposes.
