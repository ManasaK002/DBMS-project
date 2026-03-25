# 🎬 Movie Booking Website (DBMS Project)

A full-stack movie ticket booking web application built as a Database Management Systems (DBMS) project. This platform allows users to browse movies, view showtimes, and book tickets, backed by a robust database architecture.

## ✨ Features
* **User Authentication:** Secure login and registration for users.
* **Movie Catalog:** Browse current and upcoming movies with details (posters, descriptions, ratings).
* **Seat Selection:** Interactive UI to select available seats for a specific showtime.
* **Ticket Booking:** Seamless booking flow with booking confirmation.
* **Admin Dashboard:** (If applicable) Manage movies, theaters, and user bookings.

## 💻 Tech Stack
* **Frontend:** TypeScript, Vite, Tailwind CSS (with `shadcn/ui` components)
* **Backend:** PHP
* **Database:** MySQL / MariaDB (Typical for PHP setups)
* **Package Manager:** Bun / NPM

## 📂 Project Structure
``text
DBMS-project/
├── public/               # Static assets (images, icons)
├── server/               # PHP Backend API and database connection files
├── src/                  # Frontend source code (Components, Pages, Hooks)
├── components.json       # UI component configuration (shadcn)
├── tailwind.config.ts    # Tailwind CSS configuration
├── vite.config.ts        # Vite build configuration
├── bun.lockb             # Bun lockfile
└── package.json          # Frontend dependencies and scripts
🚀 Getting Started
Follow these instructions to set up the project on your local machine for development and testing.

Prerequisites
Node.js & Bun (for frontend package management)

PHP (>= 8.0) and a local server environment like XAMPP / MAMP / LAMP

MySQL database

1. Database Setup
Start your local MySQL server (via XAMPP or similar).

Create a new database for the project (e.g., movie_booking_db).

Import the provided SQL schema (if available in the server/ or root folder) to set up your tables.

Update the database credentials in your PHP connection file located in the server/ directory.

2. Backend Setup (PHP)
Place the repository inside your local server's document root:

XAMPP: htdocs/

MAMP: htdocs/

Ensure your local server is running and the PHP API endpoints in the server/ folder are accessible (e.g., http://localhost/DBMS-project/server/).

3. Frontend Setup
Open a terminal in the root directory of the project and install the dependencies using Bun (or npm):

Bash
# Install dependencies
bun install
# or npm install

# Start the frontend development server
bun run dev
# or npm run dev
The frontend should now be running on http://localhost:5173 (or the port specified by Vite). Ensure the frontend API calls are pointing to your local PHP server URL.

🤝 Contributors
ManasaK002

ritikanairr

📄 License
This project is created for educational purposes as part of a DBMS curriculum.


### Why this structure?
1. **Clear Tech Stack Identification:** It immediately recognizes your Vite + TS frontend and PHP backend setup.
2. **Setup Instructions:** Provides standard configuration steps for bridging a modern JS framework (Vite/Bun) with a local PHP/XAMPP backend.
3. **Visual Organization:** Uses badges/emojis and code blocks to make the file
