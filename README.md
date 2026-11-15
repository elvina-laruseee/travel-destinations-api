# Travel Destinations REST API

A beginner-friendly REST API for managing a list of **Travel Destinations**, built with **Node.js**, **Express**, and **Neon Postgres** (`@neondatabase/serverless`).

---

## Project Description

This API allows clients to view, add, replace, partially update, and delete travel destinations stored in a cloud PostgreSQL database hosted on Neon. Every endpoint validates incoming data, uses parameterized tagged-template SQL queries to prevent SQL injection, and returns clear HTTP status codes and JSON responses.

### Destination Fields

| Field | Type | Requirement |
| :--- | :--- | :--- |
| `id` | Integer | Auto-generated primary key |
| `name` | Text | Required |
| `country` | Text | Required |
| `continent` | Text | Required |
| `description` | Text | Optional (defaults to `null`) |
| `average_cost` | Decimal | Required (estimated travel cost in USD) |
| `rating` | Decimal | Optional (defaults to `0`, rating out of `10`) |
| `best_season` | Text | Optional (defaults to `null`) |
| `days_recommended` | Integer | Required (positive whole number) |
| `visited` | Boolean | Optional (defaults to `false`) |

---

## Requirements

- **Node.js 22** or newer (uses the built-in `--env-file=.env` and `--watch` flags)
- **npm** (comes bundled with Node.js)
- A free **Neon** account ([https://neon.tech](https://neon.tech)) for your PostgreSQL database

---

## Database Setup (Neon Postgres)

1. Go to [https://neon.tech](https://neon.tech) and sign up or log in.
2. Click **New Project**, name it `travel-destinations`, and create the project.
3. Copy your connection string (`DATABASE_URL`) from the Neon dashboard.
4. Open the **SQL Editor** in the Neon sidebar.
5. Copy the entire contents of `schema.sql` into the SQL Editor and click **Run**. This creates the `destinations` table and inserts 3 sample destinations (Paris, Tokyo, and Bali).

---

## Installation Steps

1. Open your terminal and navigate into the project folder:
   ```bash
   cd travel-destinations-api
   ```
2. Install the project dependencies:
   ```bash
   npm install
   ```

---

## Environment Configuration

1. Create a `.env` file by copying `.env.example`:
   ```bash
   cp .env.example .env
   ```
   *(On Windows PowerShell: `Copy-Item .env.example .env`)*
2. Open `.env` and paste your real Neon connection string:
   ```env
   DATABASE_URL="postgresql://your_user:your_password@ep-your-host.aws.neon.tech/neondb?sslmode=require"
   ```
3. Never commit `.env` to GitHub—it is already listed in `.gitignore`.

---

## How to Run the API

Start the development server (automatically loads `.env` and restarts when you save code changes):

```bash
npm run dev
```

The server will start at:
```text
http://localhost:3000
```

---

## Endpoint Documentation

### 1. Check API Health
- **Method & Path:** `GET /health`
- **Success Status:** `200 OK`
- **Response Body:**
  ```json
  {
    "status": "ok",
    "message": "Travel Destinations API is running."
  }
  ```

### 2. Get All Destinations
- **Method & Path:** `GET /destinations`
- **Success Status:** `200 OK`
- **Response Body:** Array of destination objects.

### 3. Get One Destination by ID
- **Method & Path:** `GET /destinations/:id`
- **Success Status:** `200 OK`
- **Error Statuses:**
  - `400 Bad Request` if `:id` is not a positive integer.
  - `404 Not Found` if no destination exists with that ID.

### 4. Create a New Destination
- **Method & Path:** `POST /destinations`
- **Success Status:** `201 Created`
- **Request Body Example:**
  ```json
  {
    "name": "Rome",
    "country": "Italy",
    "continent": "Europe",
    "description": "Historic city famous for the Colosseum and Roman Forum.",
    "average_cost": 1600.00,
    "rating": 9.3,
    "best_season": "Autumn",
    "days_recommended": 4,
    "visited": false
  }
  ```

### 5. Replace an Existing Destination
- **Method & Path:** `PUT /destinations/:id`
- **Success Status:** `200 OK`
- **Description:** Replaces all fields of the destination with the given ID. Required fields (`name`, `country`, `continent`, `average_cost`, `days_recommended`) must be included; omitted optional fields reset to their defaults (`null`, `0`, `false`).

### 6. Partially Update a Destination
- **Method & Path:** `PATCH /destinations/:id`
- **Success Status:** `200 OK`
- **Description:** Updates only the fields included in the request body.
- **Request Body Example:**
  ```json
  {
    "visited": true,
    "rating": 9.7
  }
  ```

### 7. Delete a Destination
- **Method & Path:** `DELETE /destinations/:id`
- **Success Status:** `204 No Content` (empty response body)
- **Error Statuses:**
  - `400 Bad Request` if `:id` is not a positive integer.
  - `404 Not Found` if no destination exists with that ID.
