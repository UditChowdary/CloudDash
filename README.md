☁️ CloudDash
A Serverless Personal Dashboard on AWS

[![AWS](https://img.shields.io/badge/AWS-Serverless-orange)](https://aws.amazon.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Frontend](https://img.shields.io/badge/Frontend-HTML%20%7C%20CSS%20%7C%20JS-blue)](#)
[![Backend](https://img.shields.io/badge/Backend-Lambda%20%7C%20API%20Gateway%20%7C%20DynamoDB-green)](#)
[![Status](https://img.shields.io/badge/Status-Active-success)](#)

CloudDash is a modern, lightweight personal dashboard for tracking tasks 📝, habits 🔁,
and finances 💰. It features a fully static frontend with an optional serverless backend
built on AWS ☁️.

This project highlights real-world frontend development and cloud-native backend
engineering using AWS Lambda ⚡, API Gateway 🌐, and DynamoDB 🗄️.

--------------------------------------------------

✨ KEY FEATURES

✔️ Intuitive task management for daily productivity  
✔️ Habit tracking to build consistency over time  
✔️ Basic finance logging for personal insights  
✔️ Fully static frontend with zero build step 🌍  
✔️ Optional AWS serverless backend for persistence ☁️  
✔️ Automatic local storage fallback 💾  

--------------------------------------------------

📁 PROJECT STRUCTURE

CloudDash/
|-- frontend/        Static UI (HTML, CSS, JavaScript)
|-- backend/         AWS SAM templates & Lambda functions
|-- .gitignore
|-- README.txt

--------------------------------------------------

🧰 PREREQUISITES

Local development:
- Node.js (v18+ recommended)
- Any static file server (VS Code Live Server preferred)

Backend deployment (optional):
- AWS CLI
- AWS SAM CLI
- AWS account with deployment permissions

--------------------------------------------------

🚀 RUN FRONTEND (NO BACKEND REQUIRED)

1️⃣ Clone the repository  
   git clone https://github.com/UditChowdary/CloudDash.git  

2️⃣ Navigate to the frontend directory  

3️⃣ Serve files using a static server (Live Server recommended)

4️⃣ Open in browser  
   http://127.0.0.1:5500/frontend/index.html  

⚡ No build or compilation step required.

--------------------------------------------------

☁️ SERVERLESS BACKEND (OPTIONAL)

The backend uses AWS SAM to deploy Lambda functions and expose APIs
via API Gateway.

🛠️ INSTALL AWS TOOLS

npm install -g aws-cli  
npm install -g aws-sam-cli  

Configure credentials:
aws configure  

--------------------------------------------------

📦 DEPLOY BACKEND

From the backend directory:

sam build  
sam deploy --guided  

Follow the interactive prompts to deploy resources.

--------------------------------------------------

🔗 CONNECT FRONTEND TO BACKEND

After deployment, update the API base URL in:

frontend/config.js  

This enables cloud-based data storage and retrieval.

--------------------------------------------------

📝 NOTES

• Defaults to browser local storage if backend is not configured  
• Frontend can be hosted on GitHub Pages or any static host  
• Backend follows a fully serverless AWS architecture  

--------------------------------------------------

🤝 CONTRIBUTING

Contributions are welcome!

1️⃣ Fork the repository  
2️⃣ Create a feature branch  
3️⃣ Commit your changes  
4️⃣ Open a pull request  

--------------------------------------------------

📄 LICENSE

No license is currently included.
Add an MIT or similar license if you plan to open source the project.

--------------------------------------------------

👨‍💻 AUTHOR

Udit Chowdary
