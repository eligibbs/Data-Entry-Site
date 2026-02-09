# Data Entry Site

This is a data entry application for Recovery and Detox Units.

Currently, it has a member list with optional self-registration, and activity attendance.

## Tech Stack
- **Frontend**: React, Vite, TypeScript
- **Backend**: Express, Node.js
- **Database**: SQLite with Prisma ORM

## Prerequisites
- Node.js/NPM and Git installed

## Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/eligibbs/Data-Entry-Site
   ```
   
2. **Install Dependencies**
    ```bash
    npm install
    ```

3. **Configuring**


   Copy `.env.example` to `.env` and change the options listed


4. **Initialize Database**
    ```bash
    npx prisma migrate dev --name init
    ```

## Running the Application

You need to run both the backend server and the frontend development server.

### Automated
1.  **Combo Server Starter**
    Open a terminal and run:
    ```bash
    npm start
    ```

---

### Manual

1.  **Start the Backend Server**
    Open a terminal and run:
    ```bash
    npm run server
    ```
    The server will start on `http://localhost:3000`.

2.  **Start the Frontend**
    Open a new terminal tab and run:
    ```bash
    npm run dev
    ```
    The frontend will start (usually on `http://localhost:5173`).

## As a service (Systemctl systems EX. Debian/Ubuntu/etc.)

1. **Copy the service file to `/etc/systemd/system/`**
   ```bash
   cp data-entry.service.example /etc/systemd/system/data-entry.service
   ```
   
2. **Reload the dameon**
   ```bash
   systemctl daemon-reload
   ```
   
3. **Enable the service
   ```bash
   systemctl enable --now data-entry.service
   ```
   
## Updating

### Automated

1. **Give executable permission to the update script**
   ```bash
   chmod +x update.sh
   ```
   
2. **Run the script (from the project directory)**
   ```bash
   ./update.sh
   ```

### Manual

1. **Pull the service offline (if dameonized)**
   ```bash
   systemctl stop data-entry.service
   ```
   
2. **Pull the changes**
   ```bash
   git pull
   ```
3. **Update dependencies**
   ```bash
   npm install
   ```
   
4. **Run Prisma DB migrations**
   ```bash
   npx prisma db push
   ```

5. **Bring the service back up (Again, if dameonized)**
   ```bash
   systemctl enable --now data-entry.service
   ```

## Features

- **Quick Add**: Add new members with Name, Phone Number, and Date of Birth.
- **Profile**:
    - Select a member to view details.
    - Edit member profile details.
    - Add attendance records (Date and Activity).
    - View attendance history.
