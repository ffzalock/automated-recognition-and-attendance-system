# Product Requirements Document (PRD)
## Automated Recognition and Attendance System

### 1. Project Overview
The **Automated Recognition and Attendance System** is an integrated platform designed for Mae Fah Luang University (MFU) to manage student attendance using AI-powered face recognition through CCTV cameras. The system provides a seamless experience for face enrollment, live CCTV monitoring with real-time face detection, and comprehensive attendance tracking dashboards, all while integrating with the university's IAM (Identity and Access Management) for authentication and authorization.

### 2. Objectives
- Automate student attendance tracking to reduce manual effort.
- Provide a robust and secure face enrollment process via a web interface.
- Enable real-time face detection and recognition using existing CCTV infrastructure (RTSP streams).
- Ensure data privacy (PDPA compliance) by not storing original facial images once vector embeddings are extracted.
- Centralize user management, permissions, and settings through a unified dashboard.

### 3. Architecture & Tech Stack
The system is composed of three main services:

- **Frontend (`frontend-vue`)**:
  - **Framework**: Vue.js 2 (with CoreUI Pro Admin Template).
  - **Key Libraries**: Axios, Socket.io-client, face-api.js (for client-side face enrollment validation).
  - **Functionality**: Web dashboards, face enrollment form, live CCTV viewer, settings and permission management.

- **Backend (`backend-node`)**:
  - **Framework**: Node.js, Express.js.
  - **Database**: MongoDB (via Mongoose).
  - **Key Libraries**: Socket.IO, Google Auth Library, Express Rate Limit.
  - **Functionality**: Core business logic, IAM delegated authentication, attendance records management, project permissions.

- **CCTV AI Engine (`cctv`)**:
  - **Framework**: Python, Flask.
  - **Database**: SQLite (`face_recognition.db`).
  - **Key Libraries**: OpenCV, PyTorch (for face embedding models), OpenPyXL (for Excel export).
  - **Functionality**: Consumes RTSP streams from CCTV cameras, performs real-time face detection and recognition, synchronizes known face vectors with the Node.js backend, and triggers attendance events.

- **Deployment**: Docker and Docker Compose (local, server, gitlab CI templates).

### 4. Core Features

#### 4.1. IAM & Permission Management
- Centralized login using MFU's IAM platform.
- Project-level permission matrix to assign roles (e.g., Administrator, Staff) based on user accounts.

#### 4.2. Face Enrollment
- Web-based video capture allowing students to record a 5-second video to extract 4 angles (front, left, right, tilted).
- Client-side pre-validation using `face-api.js` (tinyFaceDetector) to ensure faces are present in the frame before submission.
- Extraction of face embeddings to store in the database.
- Immediate deletion of raw images after processing to comply with Personal Data Protection Act (PDPA).

#### 4.3. Web-based Manual Check-In
- A dedicated web interface (`CheckIn.vue`) allowing students and staff to check in using a local webcam.
- Utilizes `face-api.js` directly within the browser for client-side face recognition against known embeddings.
- Implements a **Majority Voting** mechanism with a 7-frame buffer, requiring at least 4 consistent frames to stabilize identity recognition and prevent flickering.
- Real-time Check-In History panel alongside the camera feed to monitor recognized attendance events instantly.

#### 4.4. Real-Time CCTV Face Recognition
- Connection to multiple ANPR & PTZ cameras via RTSP streams.
- Live streaming viewer (MJPEG format) directly on the web dashboard.
- Continuous background threads for processing video frames, extracting faces, comparing them against the known embeddings, and recording detection events.

#### 4.5. Attendance Tracking & Reporting
- Daily and per-camera statistics for recognized individuals.
- Blacklist functionality to monitor unauthorized or flagged individuals.
- Export functionality to generate Excel reports containing face detection logs and timestamps.

### 5. Security & PDPA Compliance
- **Data Minimization**: Original face images uploaded during enrollment or captured via CCTV are processed into mathematical vectors (embeddings) and promptly deleted.
- **Authentication**: All endpoints and dashboards are secured behind IAM.
- **Secrets Management**: Configuration and secrets are loaded via environment variables (`.env`).
- **Internal APIs**: The sync process between the Python CCTV service and Node.js backend uses internal secrets (`x-cctv-secret`) to prevent unauthorized triggers.

### 6. Deployment Strategy
- Uses Docker Compose for seamless container orchestration.
- Harbor-based delivery with GitLab CI/CD pipelines.
- Proxied behind Nginx for production domains (`https://automated-recognition-and-attendance-system.mfu.ac.th`).
