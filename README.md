CloudDash

Overview
CloudDash is a lightweight personal dashboard for tasks, habits, and finances. It runs as a static frontend and can optionally connect to an AWS serverless backend (API Gateway + Lambda + DynamoDB) via SAM.

Prerequisites
- Node.js 18+
- VS Code (optional)

Run the frontend (static)
1. Open the project folder.
2. Serve the frontend folder with any static server.
3. Open frontend/index.html in your browser.

Recommended quick start (VS Code Live Server)
1. Open frontend/index.html.
2. Start Live Server.
3. The app opens at http://127.0.0.1:5500/frontend/index.html.

Optional: Backend (AWS SAM)
1. Install AWS CLI and SAM CLI.
2. Configure AWS credentials (aws configure).
3. In the backend folder, install dependencies.
4. Build and deploy the SAM template.
5. Update frontend/config.js with the deployed API base URL.

Project structure
- frontend: static UI (HTML/CSS/JS)
- backend: AWS SAM template and Lambda handlers

Notes
- If no API base URL is set, CloudDash runs in local storage mode.
