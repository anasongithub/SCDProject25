# NodeVault - Secure Vault Management System

A CLI-based vault management system with MongoDB backend, fully containerized with Docker.

## Features
-  Add, Update, Delete Records
-  Search Functionality
-  Sort Capabilities
-  Export to Text
-  Automatic Backups
-  MongoDB Integration
-  Docker Containerized

## Prerequisites
- Docker
- Docker Compose

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/anasongithub/SCDProject25.git
cd SCDProject25
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env if needed
```

### 3. Run with Docker Compose
```bash
docker-compose up --build
```

### 4. Access the Application
The backend container runs interactively. To interact:
```bash
docker attach vault-backend
```

Press `Ctrl+P` then `Ctrl+Q` to detach without stopping.

## Docker Hub
Backend Image: `anasatdocker/vault-backend:v1`

## Project Structure
```
.
├── main.js              # Main application
├── db/
│   └── mongo.js         # MongoDB connection
├── Dockerfile           # Container definition
├── docker-compose.yml   # Multi-container setup
├── .env                 # Environment variables
└── README.md            # This file
```

## Environment Variables
- `MONGODB_URI` - MongoDB connection string
- `DB_NAME` - Database name
- `PORT` - Application port

## License
ISC
