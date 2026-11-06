# SignDZ – Backend API

A RESTful API for **SignDZ**, an Algerian traditional clothing e-commerce platform.

> **Status: Currently under development.** New features and improvements will be added as the project evolves.

## Tech Stack

- **Node.js** – JavaScript runtime.
- **Express.js** – Backend framework.
- **MongoDB Atlas** – Cloud database.
- **Mongoose** – MongoDB object modeling.
- **dotenv** – Environment variables.
- **Nodemon** – Development tool.

## Features

- **Products:** CRUD operations, search, filtering, sorting, and pagination.
- **Shopping Cart:** Add, retrieve, update, remove products, and clear cart.
- **Partner Applications:** Submit partner applications.

## Project Structure

```text
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── .env
├── .gitignore
├── package.json
└── server.js
```

## Installation

```bash
git clone https://github.com/SedjaiRadja/signature-dalgerie-backend.git
cd signature-dalgerie-backend
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
ADMIN_API_KEY=your_admin_api_key
```

Start the server:

```bash
npm run dev
```

API runs at `http://localhost:5000`.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products` | Get products |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |
| GET | `/api/cart/:sessionId` | Get cart |
| POST | `/api/cart/:sessionId` | Add to cart |
| PUT | `/api/cart/:sessionId` | Update cart |
| DELETE | `/api/cart/:sessionId` | Remove product |
| DELETE | `/api/cart/:sessionId/clear` | Clear cart |
| POST | `/api/partners/apply` | Submit partner application |

## Testing

API endpoints tested using **Postman**.

## Author

**Radja Sedjai**

[GitHub](https://github.com/SedjaiRadja)

*Developed for academic purposes.*
