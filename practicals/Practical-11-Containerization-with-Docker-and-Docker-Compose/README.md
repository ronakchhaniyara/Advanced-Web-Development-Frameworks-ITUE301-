# Practical 11: Containerization with Docker and Docker Compose

**CO/PO Mapping:** CO5 / PO3, PO5

## Objective

To containerize the full-stack MERN application using Docker and orchestrate all 3 services (React frontend, Node/Express backend, and MongoDB database) with Docker Compose.

---

## Multi-Container Architecture

```text
                           docker-compose.yml
                           ┌─────────────────┐
                           │ Bridge Network: │
                           │   app-network   │
                           └────────┬────────┘
                                    │
       ┌────────────────────────────┼────────────────────────────┐
       │                            │                            │
       v                            v                            v
┌──────────────┐             ┌──────────────┐             ┌──────────────┐
│   frontend   │             │   backend    │             │   mongodb    │
│  (Port 5173) │ ──────────> │  (Port 5000) │ ──────────> │ (Port 27017) │
│ React / Vite │             │ Node/Express │             │ Mongo 6 DB   │
└──────────────┘             └──────────────┘             └──────┬───────┘
                                                                 │
                                                       ┌─────────┴─────────┐
                                                       │ Named Volume:     │
                                                       │ mongo-data:/data  │
                                                       └───────────────────┘
```

---

## Docker Artifacts

### 1. Backend Dockerfile (`task-manager-api/Dockerfile`)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

### 2. Frontend Dockerfile (`Dockerfile`)
Multi-stage build compiling React assets and serving with Vite preview:
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

EXPOSE 5173
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]
```

### 3. Orchestration Specification (`docker-compose.yml`)
```yaml
version: "3.8"

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: student-portfolio-frontend
    ports:
      - "5173:5173"
    environment:
      - VITE_API_BASE_URL=http://localhost:5000
    depends_on:
      - backend
    networks:
      - app-network

  backend:
    build:
      context: ./task-manager-api
      dockerfile: Dockerfile
    container_name: task-manager-api-backend
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - MONGO_URI=mongodb://mongodb:27017/task_manager_db
      - JWT_SECRET=super_secret_jwt_key_wdf_academic_2026
    depends_on:
      - mongodb
    networks:
      - app-network

  mongodb:
    image: mongo:6
    container_name: task-manager-mongodb
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    networks:
      - app-network

volumes:
  mongo-data:
    driver: local

networks:
  app-network:
    driver: bridge
```

---

## Execution Instructions

To build images and start the entire multi-tier stack with a single command:

```bash
docker-compose up --build
```

- React UI available at: `http://localhost:5173`
- Express API available at: `http://localhost:5000`
- MongoDB listening on: `mongodb://localhost:27017`
- Persistent task storage managed by named volume `mongo-data`.
