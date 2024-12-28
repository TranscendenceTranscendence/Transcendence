# Transcendence

**Transcendence** is a full-stack web application built as part of the 42 curriculum. It combines a real-time multiplayer game (Pong) with social features like chat, friends, and user profiles.

This README provides an overview of the project setup and guidelines for developers working on the codebase.

---

## Project Overview

### Key Features
- Real-time multiplayer Pong game with matchmaking.
- Social features: chat system, friend list, and user profiles.
- User authentication with OAuth2.
- Modern web technologies for a responsive and dynamic user experience.

### Tech Stack
- **Frontend**: React, TypeScript
- **Backend**: NestJS, TypeScript
- **Database**: PostgreSQL
- **Real-Time Communication**: WebSockets (via Socket.io)
- **Deployment**: Docker & Docker Compose

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (LTS recommended)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
- [Make](https://www.gnu.org/software/make/)

### Setup Instructions
1. Clone the repository:
   ```bash
   git clone https://github.com/eunbi0308/Transcendence.git
   cd Transcendence
   ```

2. Set up environment variables:
   - Create a `.env` file in the root directory.
   - Use the `.env.example` file as a template.

3. Start the application using the `Makefile`:
   ```bash
   make up
   ```
   This builds and starts the application.

4. Access the application:
   - Frontend: `http://localhost:3000`
   - Backend API: `https://localhost:3001`

5. Stop the application:
   ```bash
   make stop
   ```

6. For clean-up:
   ```bash
   make clean
   ```

---

## Folder Structure

### Key Directories:
- **`frontend/`**: Contains the React application (frontend code).
- **`backend/`**: Contains the NestJS application (backend code).

### Important Files:
- **`.env`**: Environment variables (backend/frontend).
- **`docker-compose.yml`**: Docker configuration for the project.
- **`Makefile`**: Simplified commands for developers.

---

## Development Workflow

### Backend and Frontend Development
```bash
# Start the application
make
```
That's it! The `Makefile` handles the setup and runs the application.

---

## Developer Notes

1. **Code Style**: Follow the existing code conventions. Use ESLint and Prettier for consistency.
2. **Environment Variables**:
   - Backend: Configure OAuth credentials, database connection strings, and WebSocket settings in the `.env` file.
   - Frontend: Update the API URL if necessary.
3. **Database**:
   - Migrations are handled automatically during Docker initialization.
   - For manual updates, check the `db/` folder.
