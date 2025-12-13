# 🚗 Rentacar - Backend API

This is the backend server for the Rentacar application, built using **Node.js**, **Express**, and **MongoDB**. It handles all business logic, database operations, and authentication.

---

## 📂 Project Structure & Architecture

We follow the **MVC (Model-View-Controller)** pattern (minus the View, since React handles that). Here is a breakdown of the folder responsibilities:

### 1. `config/` (Configuration & Connections)
* **Purpose:** Setup files that run once when the server starts.
* **Key File:** `db.js` (Connects to MongoDB Atlas).
* **Why separate it?** Keeps the main `server.js` clean and readable.

### 2. `models/` (Data Schemas - The "Nouns")
* **Purpose:** Defines the structure of our data.
* **Example:** `User.js` defines that every user must have a `name`, `email`, and `password`.
* **Tech:** Uses **Mongoose** schemas.

### 3. `routes/` (API Endpoints - The "Traffic Cops")
* **Purpose:** Decides where a request should go based on the URL.
* **Example:**
    * `POST /api/auth/login` → Send to Auth Controller.
    * `GET /api/cars` → Send to Car Controller.
* **Note:** No logic happens here; it just points to the right Controller.

### 4. `controllers/` (Business Logic - The "Brains")
* **Purpose:** This is where the actual work happens.
* **What it does:**
    1.  Receives the request data.
    2.  Validates it.
    3.  Asks the **Model** to find/save data in the Database.
    4.  Sends the final response (JSON) back to the frontend.

### 5. `middleware/` (The "Security Guards")
* **Purpose:** Functions that run *before* the controller takes over.
* **Common Use Cases:**
    * `authMiddleware.js`: Checks if the user sent a valid JWT token. If not, it blocks the request immediately.
    * `adminMiddleware.js`: Checks if the user is an Admin.

---

## 🔄 The Life Cycle of a Request
How data flows through these folders when a user logs in:

1.  **Request:** User sends `POST /api/auth/login` with email/password.
2.  **Server (`server.js`):** Receives it and sends it to **Routes**.
3.  **Route (`routes/authRoutes.js`):** Matches the URL and calls the **Controller**.
4.  **Controller (`controllers/authController.js`):**
    * Checks email/password against the **Model**.
    * Generates a Token.
    * Sends "Success" message back.

---

## 🛠️ Setup & Run
1.  **Install Dependencies:** `npm install`
2.  **Start Dev Server:** `npm run dev`