# Project Migration Guide

This guide will help you set up the project on your new device.

## Prerequisites

- Node.js installed
- MongoDB access (local or cloud)
- A GitHub repository

## Step 1: Clone the Repository

On your new device, clone the project from your GitHub repository:

```bash
git clone <your-repository-url>
cd hackathon
```

## Step 2: Setup the Backend (Server)

1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
3. Open `.env` and fill in your confidential information:
   - `MONGO_URI`: Your MongoDB connection string.
   - `GEMINI_API_KEY`: Your Google Gemini API Key.
   - `JWT_SECRET`: A secret string for authentication.
4. Install dependencies and start the server:
   ```bash
   npm install
   npm run dev
   ```

## Step 3: Setup the Frontend (Client)

1. Navigate to the client directory (from the root):
   ```bash
   cd ../client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
   *Note: If you use pnpm, run `pnpm install` instead.*
3. Start the frontend:
   ```bash
   npm run dev
   ```

## Step 4: Access your Application

- Frontend: [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal)
- Backend API: [http://localhost:5001](http://localhost:5001)

---

**Important Security Note**: Your `.env` files are ignored by Git. Never upload them to GitHub to protect your MongoDB and Google credentials.
