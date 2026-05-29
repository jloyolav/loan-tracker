# 💸 LoanTracker App

## 📌 Overview

Loan Tracker is a simple fullstack web application designed to manage personal loans between individuals.

The main goal is to provide a clear and easy way to track:

- Money lent to different people
- Payments received
- Remaining debt per person

This project is built as a portfolio piece using:

- **Frontend:** React 19 + TypeScript + Chakra UI v3 + Vite
- **Backend:** FastAPI + SQLModel
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

## ✅ Implemented Features

### 👥 Debtors

- Create a debtor (name)
- View list of debtors with current balance

### 💰 Transactions

- Add a transaction: amount, date, type (loan / payment), optional notes
- Edit and delete transactions (inline editing)
- View transaction history per debtor, sorted by date
- Import transactions from a CSV file (preview with duplicate detection)

### 📊 Balance

- Calculated total debt per debtor (derived from transactions)

---

## 🔄 Roadmap

- Authentication (users & accounts)
- Email reports
- Filter and search transactions
- Improved CSV import (flexible column names, column mapping)

---

## 🧱 Tech Stack

### Backend

- FastAPI
- SQLModel / SQLAlchemy
- PostgreSQL

### Frontend

- React 19 + TypeScript
- Chakra UI v3
- React Router v7
- Axios
- Vite 6

### Package manager

- pnpm (frontend)

---

## 🧠 Design Principles

- Start simple, iterate fast
- Prioritize working features over perfect architecture
- Keep code readable and maintainable
- Build in small, testable increments

---

## 📌 Project Status

🚧 In development — core features complete

---

## ✨ Goals of This Project

- Practice fullstack development (React + FastAPI)
- Learn how to structure a real-world application
- Build a deployable and presentable portfolio project
- Improve iteration and delivery speed
