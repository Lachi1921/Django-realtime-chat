# 💬 DjChat

**DjChat** is a **real-time chat application** built with **Django** and **Django Channels**.  
It supports **one-on-one messaging**, **group chats**, and **file sharing** .

Designed with scalability and simplicity in mind.

---

## Overview

DjChat enables users to:
- Create **public or private chat rooms**
- Exchange **messages, images, videos, and files** in real time
- **Reply** to specific messages
- Manage **notifications** and **mute** users or groups

---

## Features

### Core Features
-  **Real-time messaging** using Django Channels and WebSockets  
-  **User authentication and authorization**  
-  **Public & private chat rooms**  
-  **Group chat support** with member management (add, remove, mute)  
-  **Message replies**
-  **Media sharing** (images, videos, audio, documents)  
-  **Notifications** for new messages and events  
-  **Scalable and maintainable** backend architecture  

---

## Tech Stack

- **Backend:** Django, Django Channels  
- **Frontend:** JavaScript
- **WebSocket Protocol:** ASGI  
- **Database:** PostgreSQL / SQLite 
- **Storage:** Local or cloud file storage for uploads  

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
