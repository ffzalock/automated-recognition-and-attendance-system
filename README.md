# Automated Recognition and Attendance System

The **Automated Recognition and Attendance System** is an IAM-integrated agreement management and facial recognition attendance system developed for MFU. It provides web-based dashboards for student enrollment, real-time CCTV monitoring, and attendance tracking using a Python AI Engine.

---

## 1. Prerequisites (สิ่งที่ต้องติดตั้งก่อน)

To run this project, your machine must have the following installed:
- **Docker** and **Docker Compose**
- **Git** (if you need to clone the repository)

Ensure the following ports are free on your machine:
- `8086` (Frontend Dashboard)
- `8095` (Backend API)
- `5000` (Python CCTV Engine)
- `27017` (MongoDB)
- `6379` (Redis)

---

## 2. Environment Variables (การตั้งค่าไฟล์ Environment)

Before running the project, ensure you have the environment configuration file. The file `.env.local` must be present in the root directory.

*Note: Real `.env.local` files contain secrets and should never be committed to Git. If you are setting up for the first time from a fresh clone, you need to request the `.env.local` file from the project maintainer.*

Important initial configurations inside `.env.local`:
- `PROJECT_PERMISSION_ACCOUNT_EMAIL` or `PROJECT_PERMISSION_ACCOUNT_ID`: Used to assign the first System Administrator upon bootstrapping.

---

## 3. Quick Start: Local Development (วิธีรันโปรเจกต์)

The entire system is orchestrated using Docker Compose. To start the Database, Backend, Frontend, and AI Engine simultaneously:

1. Open your terminal in the project's root folder.
2. Run the following command:

```bash
docker compose --env-file .env.local up -d --build
```

**What this does:**
- Builds and starts all 5 containers (`redis`, `mongodb`, `backend`, `cctv`, `frontend`).
- Runs them in detached mode (`-d`).

To check the logs if something fails:
```bash
docker compose logs -f
```

To stop the system:
```bash
docker compose down
```

---

## 4. How to Access the System (การเข้าใช้งาน)

Once Docker indicates all containers are running and healthy (this may take 30-60 seconds for the database and backend to fully boot), open your web browser and navigate to:

👉 **[http://127.0.0.1:8086](http://127.0.0.1:8086)**

*(Note: The frontend port may be `8084` or `8086` depending on your `.env` configuration. Check `FRONTEND_PORT` in your `.env.local` if `8086` doesn't work).*

### First-Time Login and Setup
1. Log in using the central **IAM (Identity and Access Management)** gateway.
2. If this is a completely fresh database, you must bootstrap the initial permissions so your account becomes an admin. Run this command inside the backend node container:

```bash
docker compose exec backend npm run bootstrap:local
```
This command will create the initial Permission Matrix and assign the owner account specified in your `.env.local`.

---

## 5. Development & Testing Scripts

### Backend (`backend-node`)
If you are developing without Docker or running specific tasks, use these commands inside the `backend-node` folder:
- `npm run start:local`: Start backend locally.
- `npm run test:contracts`: Run API contract tests.
- `npm run register:iam:local`: Register the app client in local IAM.
- `npm run bootstrap:local`: Create the required database schema and first admin permissions.
- `npm run reset:permissions`: Reset all RBAC rules to default.

### CCTV AI Engine (`cctv`)
The AI engine runs on Flask. To develop locally outside of Docker:
1. Navigate to the `cctv/` directory.
2. Create a virtual environment: `python -m venv venv`
3. Activate the environment: `source venv/bin/activate` (Mac/Linux) or `venv\Scripts\activate` (Windows).
4. Install requirements: `pip install -r requirements.txt`
5. Run the server: `python app.py`

---

## 6. Server Deployment (Production)

For deploying to a production Ubuntu server, we use a separate deployment script.

```bash
APP_ENV=prod ./server.sh deploy

docker compose --env-file .env.local up -d
```
*The server compose binds the backend and frontend to `127.0.0.1` locally, allowing an Nginx reverse proxy to safely expose the application to the public internet.*

Production Domain: `https://automated-recognition-and-attendance-system.mfu.ac.th`

---

## Documentation

For a comprehensive view of how the components communicate, please refer to the documents in the `docs/` folder:
- `docs/SYSTEM-MAP.md` - System Architecture and Route map.
- `docs/prd/PRD.md` - Core Feature Requirements.
