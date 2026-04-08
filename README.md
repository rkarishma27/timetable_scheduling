# 🎓 FFCS Timetable Generator & Course Registration System

A full-stack web application that simulates the Fully Flexible Credit System (FFCS) used in universities like VIT.  
It allows students to select courses, choose faculty, manage credits, detect clashes, and visualize their timetable in real-time.

---

## 🚀 Features

- 🔐 Secure Login with CAPTCHA simulation
- 📚 Course selection by category (Core, Elective, Open Elective, etc.)
- 👨‍🏫 Faculty selection with seat availability
- ⛔ Real-time clash detection (theory & lab slots)
- 📊 Credit limit enforcement (max 25 credits)
- 🗓️ Interactive timetable visualization
- 🔄 ETL (Embedded Theory Lab) preference handling
- ⚡ Fast validation using optimized data structures
- 🧾 Final review & submission workflow
- 🌐 Backend API for timetable validation

---

## 🧠 Tech Stack

### Frontend
- React.js (Hooks)
- Inline CSS (custom UI design)
- Canvas API (CAPTCHA rendering)

### Backend
- Node.js
- Express.js
- REST API

---

## ⚙️ How It Works

1. User logs in with registration number + CAPTCHA  
2. Selects courses from categorized list  
3. Chooses faculty and slot combinations  
4. System checks:
   - Slot clashes
   - Credit limits
5. Builds timetable dynamically  
6. Final submission sends data to backend API  

---

## 🧩 Core Concepts Used

### Data Structures
- `Set` → O(1) clash detection  
- `Object (HashMap)` → Slot-to-course mapping  
- `Arrays` → Course & selection storage  
- `Grid (2D representation)` → Timetable layout  

### Algorithms
- Greedy Selection (user-driven)
- Constraint Validation
- Slot Conflict Detection

--
