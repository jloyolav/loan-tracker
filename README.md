# 💸 LoanTracker App

## 📌 Overview

Loan Tracker is a simple fullstack web application designed to manage personal loans between individuals.

The main goal is to provide a clear and easy way to track:
- Money lent to different people
- Payments received
- Remaining debt per person

This project is built as a portfolio piece using:
- **Frontend:** React + Chakra UI
- **Backend:** FastAPI
- **Database:** PostgreSQL

---

## 🎯 Problem

Managing personal loans manually (e.g., spreadsheets or notes) can become confusing over time:
- Hard to track partial payments
- Easy to lose history
- No clear view of current debt

This app aims to solve that with a simple and structured interface.

---

## 👤 Target User

- Individuals managing personal loans to friends or family
- Users who want a lightweight alternative to spreadsheets

---

## 🚀 MVP Scope (Version 0.1)

This first version focuses on **core functionality only**.

### 👥 Debtors (Deudores)
- Create a debtor (name)
- View list of debtors

### 💰 Transactions
- Add a transaction:
  - Amount
  - Date
  - Associated debtor
  - Type:
    - Loan given
    - Payment received

### 📊 Basic Visualization
- View all transactions per debtor

---

## 🔄 Future Iterations

### 🔹 Version 0.2
- Calculate total debt per debtor
- Display balance clearly in UI

### 🔹 Version 0.3
- Edit/delete transactions
- Filter transactions
- Improve UI/UX

### 🔹 Version 0.4 (Optional)
- Authentication (users & accounts)
- Email reports
- Data export (CSV)

---

## 🧱 Tech Stack

### Backend
- FastAPI
- SQLModel / SQLAlchemy
- PostgreSQL

### Frontend
- React
- Chakra UI
- Axios

### Deployment
- Backend: Render / Railway
- Frontend: Vercel / Netlify

---

## 🧠 Design Principles

- Start simple, iterate fast
- Prioritize working features over perfect architecture
- Keep code readable and maintainable
- Build in small, testable increments

---

## 📌 Project Status

🚧 In development — starting with MVP (v0.1)

---

## ✨ Goals of This Project

- Practice fullstack development (React + FastAPI)
- Learn how to structure a real-world application
- Build a deployable and presentable portfolio project
- Improve iteration and delivery speed
