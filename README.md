CloudDash

CloudDash is a lightweight personal dashboard for tracking tasks, habits, and finances.
It is designed as a static frontend application with an optional serverless backend powered by AWS.

This project demonstrates frontend development skills along with cloud-native backend
development using AWS Lambda, API Gateway, and DynamoDB.


FEATURES

- Task tracking to manage daily to-do items
- Habit tracking to monitor consistency over time
- Simple finance tracking for basic expense logging
- Static frontend that runs entirely in the browser
- Optional AWS serverless backend for cloud persistence
- Local storage fallback when no backend is configured


PROJECT STRUCTURE

CloudDash/
|-- frontend/        Static frontend (HTML, CSS, JavaScript)
|-- backend/         AWS SAM templates and Lambda functions
|-- .gitignore
|-- README.txt


PREREQUISITES

To run the project locally:
- Node.js (v18 or later recommended)
- A static file server (VS Code Live Server or similar)

For backend deployment (optional):
- AWS CLI
- AWS SAM CLI
- An AWS account with appropriate permissions


RUNNING THE FRONTEND (STANDALONE)

The frontend can run independently without the backend.

1. Clone the repository:
   git clone https://github.com/UditChowdary/CloudDash.git

2. Open the frontend directory.

3. Serve the files using any static server
   (for example, Live Server in VS Code).

4. Open the application in your browser:
   http://127.0.0.1:5500/frontend/index.html

No build step is required since the frontend is fully static.


SERVERLESS BACKEND (OPTIONAL)

The backend uses AWS SAM to deploy Lambda functions and API Gateway endpoints.

INSTALL AWS TOOLS

npm install -g aws-cli
npm install -g aws-sam-cli

Configure AWS credentials:
aws configure


BUILD AND DEPLOY BACKEND

From the backend directory, run:
sam build
sam deploy --guided

Follow the prompts to deploy the stack.


CONNECT FRONTEND TO BACKEND

After deployment, update the API endpoint in the frontend configuration file:
frontend/config.js

This allows the frontend to store and retrieve data from the deployed AWS backend.


NOTES

- If no backend API is configured, CloudDash automatically uses browser local storage.
- The frontend can be hosted on GitHub Pages or any static hosting provider.
- The backend follows a fully serverless architecture using AWS services.


CONTRIBUTING

Contributions are welcome.

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request


LICENSE

This project does not currently include a license file.
Add one (such as MIT) if you plan to make it open source.


AUTHOR

Udit Chowdary
