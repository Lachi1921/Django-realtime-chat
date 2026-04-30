# DjChat

[![Python](https://img.shields.io/badge/python-%3E%3D3.10-blue)]()

DjChat is a real-time chat application built with Django, Django Channels, and JavaScript on the frontend. It supports one-on-one messaging, group chats, messages (send, reply, edit, delete), and media sharing (images, audio, video, documents), along with secure authentication and profile management. It has clean backend logic for reliable, fast communication.

---

## Features
-  Real-time messaging using Django Channels and WebSockets  
-  User authentication and authorization  
-  Public & private chat rooms
-  Group chat support with member management (add, remove, mute)  
-  Messages (send, reply, edit, delete)
-  Media sharing (images, videos, audio, documents)  
-  Clean and maintainable backend in django & python

---

## Tech Stack

- Backend: Django, Django Channels
- Frontend: JavaScript (Django Templates)
- Database: PostgreSQL / SQLite

---

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/<your-username>/djchat.git
   cd djchat
   ```

2. Create and activate a virtual environment:

   ```bash
   python -m venv venv
   source venv/bin/activate   # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Run migrations:

   ```bash
   python manage.py migrate
   ```

5. Start the Django Channels server:

   ```bash
   python manage.py runserver
   ```

6. Open your browser and visit:

   ```
   http://127.0.0.1:8000
   ```

---
