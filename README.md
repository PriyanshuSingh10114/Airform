<h1>Airform – Dynamic Form Builder with Airtable Integration </h1>

Airform is a full-stack MERN application that allows users to build dynamic forms connected directly to Airtable Bases & Tables.
It supports conditional logic, multi-question types, attachments, response tracking, and Airtable OAuth-based authentication.

---

This project includes:

✨ Form Builder

✨ Airtable OAuth 2.0 (PKCE) Authentication

✨ Conditional Logic Engine

✨ Response Viewer with Status Updates

✨ File Uploads

✨ Airtable Webhook Support

---

<h1>🚀 Features</h1>

🔐 Airtable OAuth Login (PKCE-based secure authentication)

🎨 Drag-and-Drop Form Builder

🧠 Conditional Logic Engine (show/hide questions based on answers)

📁 File Attachments (Multer-based backend processing)

📊 Response Dashboard with Status Updates (Approved, Pending, Rejected, Reviewed)

🔗 Airtable Integration for Bases, Tables, and Schema

🔔 Webhook Support for Real-time Airtable Data Sync

🌐 Deployed Frontend (Vercel) + Backend (Render)

---


<h1> 📁 Project Structure</h1>

Airform/
 ├── client/         
 ├── server/         
 ├── README.md       

---

<h1>🛠️ Tech Stack</h1>

<h3>Frontend</h3>

React.js

React Router

Axios

Custom CSS

<h3>Backend</h3>

Node.js

Express

Airtable OAuth 2.0

Multer (File uploads)

MongoDB + Mongoose

Express-session

Integrations

Airtable REST API

Airtable Webhooks

---

<h1>⚙️ Setup Instructions</h1>

1️⃣ Clone the Repository

git clone https://github.com/PriyanshuSingh10114/Airform

cd Airform

🎨 Frontend Setup (client/)

cd client

npm install


Add frontend environment file

Create .env:

REACT_APP_BACKEND_URL=https://your-backend-url.onrender.com

Run locally
npm start


Frontend runs on:

http://localhost:3000

---

<h1>To deploy</h1>

Vercel → Import repo → Set REACT_APP_BACKEND_URL

🔧 Backend Setup (server/)

cd server
npm install

Create .env file

PORT=7000

MONGO_URI=your-mongodb-uri

AIRTABLE_CLIENT_ID=xxxx

AIRTABLE_CLIENT_SECRET=xxxx

AIRTABLE_REDIRECT=https://your-backend-url.onrender.com/auth/callback

FRONTEND_URL=https://airform-tau.vercel.app

SESSION_SECRET=super-secret-value

Run Backend
npm start


Backend runs on:

http://localhost:7000

🔐 Airtable OAuth Setup Guide

Go to Airtable OAuth settings:
👉 https://airtable.com/developers/web/oauth

Click Create OAuth Integration

Fill:

Name: Airform

Redirect URI:

https://your-backend-url.onrender.com/auth/callback


Add Scopes:

data.records:read

data.records:write

schema.bases:read

webhook:manage

Add Privacy Policy and Terms URLs (placeholders allowed)

Copy:

Client ID

Client Secret

Add them to backend .env.

---

<h1>🔁 OAuth Login Flow</h1>
Frontend → /auth/airtable (backend)
Backend → Airtable authorize
Airtable → Backend /auth/callback
Backend → Issues tokens → Redirects user to frontend

<h1>🧱 Data Model Explanation</h1>
### User Model
airtableUserId: String
email: String
name: String
oauth: {
  accessToken: String,
  refreshToken: String
}

Form Model
title: String
questions: [
  {
    label: String,
    questionKey: String,
    type: String,
    options: [],
    required: Boolean,
    conditional: {...}
  }
]

Response Model
formId: ObjectId
answers: { key: value }
status: "Pending" | "Approved" | "Rejected" | "Reviewed"
createdAt: Date

---

<h1>🔄 Conditional Logic Explanation</h1>h

Every question can include:

{
  "conditional": {
    "questionKey": "q1",
    "operator": "equals",
    "value": "Yes"
  }
}


The logic engine (utils/logicEngine.js):

✔ Checks if question should be visible
✔ Evaluates condition on the fly
✔ Hides/shows questions dynamically

Operators supported:

equals

not_equals

includes

not_includes

---

<h1>🔔 Webhook Configuration</h1>

Airform supports Airtable webhooks for:

Table updates

New records

Modified records

Register Webhook

Backend route:

POST /webhooks/register

Receive Events
POST /webhooks/callback


Airtable sends:

changedValues

createdRecords

Webhook signature verification can be added for production.

---

<h1>▶️ How to Run the Full Project Locally</h1>
Terminal 1 — Backend
cd server
npm install
npm start

Terminal 2 — Frontend
cd client
npm install
npm start

Access frontend:
http://localhost:3000

Login:
Login with Airtable → Authorize → Redirect → Dashboard

---

<h1>⭐ Contributing</h1>

Pull requests are welcome.
For major changes, open an issue first.

📄 License

MIT License.
