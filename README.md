##🎬 Movie Booking Website

A full-stack movie ticket booking web application built as part of a Database Management Systems (DBMS) project.
Users can browse movies, check showtimes, and book tickets with a seamless UI backed by a structured database.

🚀 Features
🔐 User Authentication (Login / Register)
🎥 Movie Listings with details (poster, rating, description)
🪑 Interactive Seat Selection
🎟️ Ticket Booking System
📊 Admin Dashboard (manage movies, shows, bookings)
🧑‍💻 Tech Stack
Frontend: TypeScript, Vite, Tailwind CSS, shadcn/ui
Backend: PHP
Database: MySQL / MariaDB
Package Manager: Bun / NPM
📁 Project Structure
DBMS-project/
├── public/               # Static assets
├── server/               # PHP backend (APIs + DB)
├── src/                  # Frontend source
├── components.json       # shadcn config
├── tailwind.config.ts    # Tailwind config
├── vite.config.ts        # Vite config
├── package.json
└── bun.lockb
⚙️ Setup & Installation
1️⃣ Clone the Repository
git clone https://github.com/your-username/DBMS-project.git
cd DBMS-project
2️⃣ Database Setup
Start MySQL (XAMPP / MAMP)
Create database:
CREATE DATABASE movie_booking_db;
Import the provided .sql file
Update DB credentials in:
server/db_connection.php
3️⃣ Backend Setup (PHP)
Move project to:
htdocs/
Start Apache server
Verify backend:
http://localhost/DBMS-project/server/
4️⃣ Frontend Setup
# Install dependencies
bun install
# OR
npm install

# Run development server
bun run dev
# OR
npm run dev

Frontend runs on:

http://localhost:5173
🔗 API Configuration

Make sure frontend API calls point to:

http://localhost/DBMS-project/server/
👥 Contributors
ManasaK002
ritikanairr
📄 License

This project is for educational purposes (DBMS coursework).
