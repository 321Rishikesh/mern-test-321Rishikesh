# Backend

Express backend for Student Course Management System.

## Environment

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
NODE_ENV=development
```

`JWT_ACCESS_SECRET` is also supported as fallback.

## Scripts

- `npm run dev`: start backend with watch mode
- `npm start`: start backend normally

## API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/courses`
- `GET /api/courses`
- `DELETE /api/courses/:id`
