# 🍳 Culinary Management System – Recipe Book

A full-stack MERN application for sharing, discovering, and managing recipes. Features dual role authentication (Admin/User), recipe approval workflow, ratings, comments, and bookmarks.

## 🚀 Tech Stack

- **Frontend**: React.js, Tailwind CSS, Framer Motion, React Router, Axios
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT, Multer, bcrypt.js

---

## 📁 Project Structure

```
culinary-app/
├── backend/
│   ├── controllers/       # Business logic
│   ├── middleware/        # Auth & upload middleware
│   ├── models/            # Mongoose schemas
│   ├── routes/            # Express routes
│   ├── uploads/           # Uploaded images
│   ├── utils/             # Seed data
│   ├── server.js
│   └── package.json
└── frontend/
    ├── public/
    └── src/
        ├── components/    # Reusable UI components
        ├── context/       # Auth context
        ├── pages/         # All pages
        ├── services/      # Axios API calls
        ├── App.js
        └── index.js
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

---

### 1. Clone / Extract the project

```bash
cd culinary-app
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file (copy from `.env.example`):

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/culinary_db
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**Seed the database** (optional but recommended):

```bash
npm run seed
```

This creates:
- Admin: `admin@culinary.com` / `Admin@123`
- Users: `maria@example.com` / `Test@123`
- Sample approved & pending recipes

**Start the backend:**

```bash
npm run dev        # Development (with nodemon)
npm start          # Production
```

Backend runs on **http://localhost:5000**

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_UPLOADS_URL=http://localhost:5000
```

**Start the frontend:**

```bash
npm start
```

Frontend runs on **http://localhost:3000**

---

## 🔑 Default Login Credentials (after seeding)

| Role  | Email                    | Password   |
|-------|--------------------------|------------|
| Admin | admin@culinary.com       | Admin@123  |
| User  | maria@example.com        | Test@123   |
| User  | john@example.com         | Test@123   |
| User  | priya@example.com        | Test@123   |

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint                    | Description       |
|--------|-----------------------------|-------------------|
| POST   | /api/auth/register          | User registration |
| POST   | /api/auth/login             | User login        |
| POST   | /api/auth/admin/login       | Admin login       |
| GET    | /api/auth/me                | Get current user  |
| PUT    | /api/auth/profile           | Update profile    |
| PUT    | /api/auth/change-password   | Change password   |

### Recipes
| Method | Endpoint                    | Description           |
|--------|-----------------------------|-----------------------|
| GET    | /api/recipes                | Get all (paginated)   |
| GET    | /api/recipes/featured       | Featured recipes      |
| GET    | /api/recipes/latest         | Latest recipes        |
| GET    | /api/recipes/:id            | Recipe detail         |
| POST   | /api/recipes                | Submit recipe (auth)  |
| PUT    | /api/recipes/:id            | Update recipe (auth)  |
| DELETE | /api/recipes/:id            | Delete recipe (auth)  |
| POST   | /api/recipes/:id/rate       | Rate recipe (auth)    |
| POST   | /api/recipes/:id/bookmark   | Toggle bookmark (auth)|
| GET    | /api/recipes/my-recipes     | My recipes (auth)     |
| GET    | /api/recipes/bookmarks      | My bookmarks (auth)   |

### Admin
| Method | Endpoint                         | Description           |
|--------|----------------------------------|-----------------------|
| GET    | /api/admin/dashboard             | Dashboard stats       |
| GET    | /api/admin/recipes               | All recipes           |
| PUT    | /api/admin/recipes/:id/approve   | Approve recipe        |
| PUT    | /api/admin/recipes/:id/reject    | Reject recipe         |
| PUT    | /api/admin/recipes/:id/featured  | Toggle featured       |
| GET    | /api/admin/users                 | All users             |
| PUT    | /api/admin/users/:id/toggle-block| Block/unblock user    |
| DELETE | /api/admin/users/:id             | Delete user           |

### Comments
| Method | Endpoint                         | Description    |
|--------|----------------------------------|----------------|
| POST   | /api/comments/recipe/:recipeId   | Add comment    |
| PUT    | /api/comments/:id                | Edit comment   |
| DELETE | /api/comments/:id                | Delete comment |

---

## 🧪 Testing with Postman

1. Import all endpoints above
2. Register/login to get a JWT token
3. Add `Authorization: Bearer <token>` header to protected routes
4. For file uploads, use `form-data` instead of JSON

---

## ✨ Features

- ✅ JWT Authentication (User + Admin)
- ✅ Recipe submission & approval workflow
- ✅ Image uploads (Multer)
- ✅ Star ratings & comments
- ✅ Bookmarking / favorites
- ✅ Search & category filtering
- ✅ Admin dashboard with stats
- ✅ User management (block/unblock/delete)
- ✅ Responsive design (mobile-first)
- ✅ Orange-yellow gradient theme
- ✅ Glassmorphism cards
- ✅ Framer Motion animations
- ✅ Pagination
- ✅ Toast notifications
