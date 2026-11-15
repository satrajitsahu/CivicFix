
# CivicFix – Smart Civic Complaint Reporting System

> **Academic Project:** Full Stack Web Development (CA-3 Assignment)  
> **Architecture:** MERN Stack (MongoDB Atlas, Express.js, React.js, Node.js)

CivicFix is a web-based civic complaint management system that allows citizens to report local issues and track their resolution. Administrators can manage complaints, update their status, and monitor reported problems through a centralized dashboard.

The system aims to improve communication between citizens and local authorities through a simple, transparent, and accessible digital platform.

---

## 1. Project Objectives

- Provide an online platform for reporting civic problems.
- Allow citizens to track complaint status.
- Help administrators manage and resolve complaints.
- Reduce duplicate complaints through duplicate detection.
- Improve transparency and communication.
- Maintain complaint records in a centralized database.

---

## 2. Technology Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- JavaScript
- React Router DOM
- Fetch API

### Backend
- Node.js
- Express.js
- REST API
- JWT Authentication
- bcrypt password hashing
- Multer for file uploads

### Database
- MongoDB
- MongoDB Atlas
- Mongoose

### Development Tools
- Visual Studio Code
- Postman
- Git and GitHub
- npm

---

## 3. Main Features

### Citizen Features
- Citizen registration and login.
- Secure authentication.
- Submit civic complaints.
- Upload complaint-related images.
- View submitted complaints.
- Track complaint status.
- View complaint details.

### Administrator Features
- Admin login.
- View reported complaints.
- Manage complaints.
- Update complaint status.
- Monitor complaint information through the dashboard.

### Community Duplicate Alert
CivicFix includes a duplicate complaint detection feature.

When a citizen selects a complaint category and enters a location, the frontend checks for similar unresolved complaints through the backend API.

If a potentially similar complaint is found, the application displays an alert to inform the citizen.

This helps reduce duplicate reports and makes complaint management more efficient.

**Note:** The duplicate alert is a warning, not a guarantee that two complaints refer to the same issue.

---

## 4. Project Folder Structure

```text
CivicFix/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   └── complaintController.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   └── uploadMiddleware.js
│   │
│   ├── models/
│   │   ├── Complaint.js
│   │   └── User.js
│   │
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   └── complaintRoutes.js
│   │
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── seedAdmin.js
│   │
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
├── package.json
└── README.md
```

---

## 5. Installation and Setup

### Prerequisites

Install the following before running the project:

- Node.js
- npm
- MongoDB Atlas account or a local MongoDB server
- Git

### Step 1: Clone the Repository

```bash
git clone https://github.com/satrajitsahu/CivicFix.git
cd CivicFix
```

### Step 2: Install Root Dependencies

```bash
npm install
```

### Step 3: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 4: Configure Backend Environment Variables

Create a `.env` file inside the `backend` folder.

Use the following configuration:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=YOUR_MONGODB_CONNECTION_STRING

JWT_SECRET=YOUR_LONG_RANDOM_SECRET

ADMIN_NAME=System Administrator
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=CHANGE_THIS_PASSWORD
```

Replace the placeholder values with your own configuration.

**Important:** Never upload your actual `.env` file or database credentials to GitHub.

### Step 5: Configure Frontend Environment Variables

If your frontend configuration uses an API URL environment variable, create `frontend/.env` using the variable name specified in `frontend/.env.example`.

For example:

```env
VITE_API_URL=http://localhost:5000/api
```

### Step 6: Run the Backend

From the `backend` directory:

```bash
npm run dev
```

If the project does not define a development script, use:

```bash
npm start
```

### Step 7: Run the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite in your browser.

---

## 6. Database Configuration

CivicFix uses MongoDB with Mongoose for storing application data.

The backend connects to the database using the `MONGODB_URI` environment variable.

The application uses database models to manage:

- User information.
- Complaint details.
- Complaint categories.
- Complaint locations.
- Complaint status and related records.

For persistent cloud storage, configure a valid MongoDB Atlas connection string in `backend/.env`.

---

## 7. Authentication and Security

The application includes:

- JWT-based authentication.
- Password hashing using bcrypt.
- Protected routes.
- Authentication middleware.
- Environment-based configuration.
- Centralized error handling.

Passwords should never be stored as plain text.

Sensitive configuration values must remain in environment files and must not be committed to GitHub.

---

## 8. API Overview

The backend exposes REST API endpoints for authentication, complaints, and administration.

| Module | Purpose |
|---|---|
| Authentication | Registration and login |
| Complaints | Create and retrieve complaints |
| Duplicate Check | Find potentially similar unresolved complaints |
| Administration | Manage complaints and administrative operations |

The exact endpoint paths and HTTP methods are defined in the backend route files.

---

## 9. Community Duplicate Alert – Working

The duplicate alert feature follows this process:

1. A citizen selects a complaint category.
2. The citizen enters the affected location.
3. The frontend sends a request to the duplicate-check API.
4. The backend checks existing unresolved complaints.
5. Similar category and location information is compared.
6. If a possible match is found, an alert appears on the complaint form.
7. The citizen can review the warning before submitting the complaint.

This feature encourages citizens to check existing reports before creating another complaint.

---

## 10. Testing

The backend includes test scripts for checking database connectivity, API workflows, and duplicate detection.

Relevant test files include:

- `test-atlas-connection.js`
- `test-atlas-e2e-api.js`
- `test-db.js`
- `test-duplicate-alert.js`

Run these scripts using Node.js from the backend directory when the required environment variables and server configuration are available.

---

## 11. Future Enhancements

- Google Maps integration for precise complaint locations.
- Email and SMS notifications.
- Real-time complaint status updates.
- Complaint analytics and visual reports.
- Department-wise complaint assignment.
- Citizen feedback and rating system.
- Mobile application support.

---

## 12. Frequently Asked Questions

### 1. How is password security handled?

Passwords are hashed using bcrypt before being stored in the database.

### 2. How does JWT authentication work?

After successful login, the backend generates a JWT. The frontend uses the token when accessing protected API routes.

### 3. How does the Community Duplicate Alert feature work?

The application checks existing unresolved complaints for similar categories and location keywords and displays a warning when a potential duplicate is found.

### 4. Why use the native Fetch API instead of Axios?

The Fetch API is built into modern browsers and supports HTTP requests without requiring an additional library.

---

## 13. Project Information

**Project Name:** CivicFix – Smart Civic Complaint Reporting System

**Project Type:** Full Stack Web Development Project

**Technology:** MERN Stack

**Repository:** https://github.com/satrajitsahu/CivicFix

**Developer:** Satrajit Sahu

---

## 14. Conclusion

CivicFix provides a digital platform for citizens to report civic problems and monitor their progress. It helps administrators organize and manage complaints through a centralized system.

The project demonstrates the practical implementation of full-stack web development using MongoDB, Express.js, React.js, and Node.js.
