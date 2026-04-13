# 🛠️ ATNIS - Advanced Technician & Network Integration Services

ATNIS is a comprehensive MERN-stack service booking and management platform designed to streamline the interaction between customers, service providers, and technicians. From high-speed networking setup to smart home automation and appliance repair, ATNIS provides a robust infrastructure for booking, tracking, and managing technical services.

---

## 🚀 How to Approach the Project

The ATNIS project is structured as a **Monorepo** consisting of two main parts:
1.  **Frontend**: A modern React application built with Vite, utilizing React Router for navigation and Zustand for lightweight state management.
2.  **Backend**: A robust Node.js/Express server connecting to MongoDB, handling everything from JWT-based authentication to real-time job queuing and status updates.

### Recommended Workflow for Developers:
*   **Step 1: Environment Setup**: Configure your `.env` files in both the root and backend folders.
*   **Step 2: Database Seeding**: Run the provided seed scripts (e.g., `node seed.js` in the backend) to populate categories and services.
*   **Step 3: Execution**: Use the root command `npm run dev` to launch both the frontend and backend concurrently.

---

## 🌟 Key Features & Service Categories

ATNIS is categorized into dedicated technical domains to provide specialized solutions.

### 🏠 Service Categories
*   **🌐 Networking & Connectivity**: LAN/WAN setup, Wi-Fi configuration, VPN, and firewall security.
*   **⚡ Electrical & Power**: House wiring, solar installations, earthing, and DB board upgrades.
*   **🛡️ Security Systems**: CCTV installation, DVR/NVR setup, and smart doorbell integration.
*   **❄️ Air Conditioning**: Installation, deep cleaning, gas refilling, and repair.
*   **💻 IT & Computing**: PC assembly, laptop repair, virus removal, and data recovery.
*   **🧺 Home Appliances**: Washing machines, refrigerators, microwaves, and TV repairs.
*   **🏗️ Construction & Plumbing**: General plumbing, bathroom fitting, tiling, and false ceiling design.
*   **🏠 Smart Home**: Smart lighting, automation hubs, and smart lock installations.

---

## 🔧 User Roles & Instructions

The platform supports a modular permission system with four distinct entry points.

### 1. 👤 Customer (User)
*   **Browse & Search**: Navigate through categories or use the search bar to find specific services.
*   **Detailed View**: Click on any service to see pricing, includes, and estimated time.
*   **Seamless Booking**: Add services to your cart and book them with a single click (requires login).
*   **Manage My Jobs**: View your booking history and current status from the "Bookings" dashboard.
*   **Invoicing**: Download or print professional invoices for completed services.

### 2. 👨‍🔧 Technician
*   **Job Dashboard**: Access a dedicated view of jobs specifically assigned to you.
*   **Status Management**: Update job progress in real-time (e.g., from 'Assigned' to 'Completed').
*   **Job Details**: View customer location, service type, and specific instructions provided during booking.

### 3. 🛡️ Admin / Service Center
*   **Centralized Queue**: Manage all incoming service requests via the **Token Queue Page**.
*   **Technician Management**: Add, update, or remove technicians and monitor their performance.
*   **System Analytics**: View overall booking trends and category popularity.
*   **Manual Override**: Admins have the power to reassign jobs and manage critical service metrics.

---

## 💻 Technical Stack

### **Frontend**
*   **Framework**: React 19 (Vite)
*   **Routing**: React Router 7
*   **State Management**: Zustand
*   **Feedback**: React Hot Toast
*   **Invoicing**: React-to-Print

### **Backend**
*   **Server**: Node.js & Express
*   **Database**: MongoDB (via Mongoose)
*   **Authentication**: JWT (JSON Web Tokens) & BcryptJS
*   **File Handling**: Multer & Cloudinary (for service images)
*   **Security**: Helmet & CORS
*   **Document Generation**: PDFKit (for automated invoice generation)

---

## 🛠️ Getting Started

### Prerequisites
*   Node.js (v18+)
*   MongoDB Instance (Local or Atlas)

### 1. Clone & Install
```bash
git clone <repository-url>
cd atnis-project
npm run install-all  # Installs both frontend and backend dependencies
```

### 2. Configuration
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### 3. Seed the Database
```bash
cd backend
node seed.js  # This will populate the system with default categories and services
```

### 4. Application Launch
From the root directory:
```bash
npm run dev
```

---

## 📂 Project Structure

```text
ATNIS-PROJECT/
├── backend/            # Express API, Mongoose Models, Controllers
│   ├── models/         # Database Schemas (User, Booking, Service, etc.)
│   ├── routes/         # API Endpoints
│   ├── controllers/    # Business Logic
│   └── seed.js         # Initial Database Setup
├── frontend/           # Vite + React Application
│   ├── src/
│   │   ├── components/ # Reusable UI Components
│   │   ├── pages/      # Route-level components & Dashboards
│   │   ├── state/      # Zustand store logic
│   │   └── context/    # Auth and Theme context
└── package.json        # Root scripts for concurrent execution
```

---

## 📄 License
This project is proprietary. Please contact the project owner for usage permissions.

---
**Developed with ❤️ for the ATNIS Service Ecosystem.**
