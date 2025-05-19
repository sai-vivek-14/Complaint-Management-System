# INSTASOLVE: Full Stack Web Application

This is a full stack web application built using **Django (Backend)** and **React (Frontend)**. It uses **REST APIs**, **Axios**, **Tailwind CSS**, and **Django authentication**.
This project is a Hostel Complaint System built using Django and React. The main idea of our project is that there are four types of logins: student, warden, hostel, and django super user. Each hostel has its own login.

Students can raise issues or complaints through their login. These complaints will be visible in the warden's dashboard. The warden can either accept or reject the complaint. Once a decision is made, the status will be updated on the student's side, and email notifications will be sent to all relevant users.

Additionally, the warden can download a CSV file of all complaints for record-keeping and further processing.

---
### ✅ Flow of Complaint Handling

1. **Student** raises a complaint through the web portal.
2. The complaint appears in the **Warden’s dashboard**.
3. The **Warden** can:
   - **Accept** or **Reject** the complaint.
   - **Download a CSV report** of all complaints for record-keeping.
4. **Status updates** (Accepted/Rejected) are:
   - Shown in the student dashboard.
   - **Emailed** to the concerned student for transparency.
  
     
Technologies Used
Frontend: React, Axios, Tailwind CSS

Backend: Django, Django REST Framework

API Communication: Django REST + Axios

Auth: Django Authentication / JWT (if used)

Dev Tools: Vite, CORS headers


## 📁 Project Structure
INSTASOLVE/
│
├── Backendd/ # Django backend
├── requirements.txt # Python dependencies for Django
└── package.json # JavaScript dependencies for React



Open a terminal and navigate to the `INSTASOLVE` folder:

```bash
cd INSTASOLVE

npm install
npm run dev

cd INSTASOLVE/Backendd
pip install -r ../requirements.txt
python manage.py runserver




