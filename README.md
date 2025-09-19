
# 🏫 School Payments & Dashboard

A **full-stack application** for managing school fee payments and transaction dashboards.

**Backend:** NestJS + MongoDB  
**Frontend:** React (Vite) + TailwindCSS

The app supports creating payment requests, checking payment statuses, webhook handling, and a transaction dashboard for schools.

---

## 🔗 Live Demo / Hosted App

> _(Add links here once deployed)_

---

## 🧩 Features

### Backend (NestJS)
- **JWT Authentication** (register / login)
- **Payment APIs**
  - Create payment requests
  - Check payment status (Cashfree sandbox)
  - Webhook endpoint to receive payment updates
- **Transaction APIs**
  - List all transactions (pagination, filters)
  - Transactions by `school_id`
  - Transaction status by `custom_order_id`
- **Mongoose Schemas**: User, Order, OrderStatus

### Frontend (React + Tailwind)
- Login / Register
- Dashboard overview (KPIs & recent transactions)
- Transactions overview: searchable, filterable, sortable, paginated table
- Transactions by school
- Transaction status check (by custom order ID)
- Create Payment page (generate payment link and open redirect)
- Dark mode toggle and polished SaaS-like UI

---

## 📦 Project Structure

```
school-payments/
├── school-payments-backend/   # NestJS backend
├── school-payments-frontend/  # React + Vite frontend
└── README.md
```

### Backend Highlights

```
school-payments-backend/
├── src/
│   ├── auth/
│   ├── payments/
│   ├── transactions/
│   ├── webhook/
│   ├── schemas/
│   ├── app.module.ts
│   └── main.ts
├── .env
└── package.json
```

### Frontend Highlights

```
school-payments-frontend/
├── src/
│   ├── api/
│   ├── components/
│   ├── pages/
│   ├── App.tsx
│   └── main.tsx
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## ⚙️ Setup — Backend (Local Development)

1. Go to the backend folder:
    ```
    cd school-payments-backend
    ```

2. Create a `.env` file from `.env.example` (sample below).

3. Install dependencies and start the server:
    ```
    npm install
    npm run start:dev
    ```

    Default server: http://localhost:3000/api

4. **Required environment variables**:

    ```
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=superSecretKey
    JWT_EXPIRES_IN=7d

    # Payment gateway (test)
    PG_KEY=edvtest01
    PAYMENT_API_KEY=eyJ...       # example test API key
    SCHOOL_ID=65b0e6293e9f76a9694d84b4
    PAYMENT_API_URL=https://dev-vanilla.edviron.com/erp
    PORT=3000
    ```

---

## ⚙️ Setup — Frontend (Local Development)

1. Go to the frontend folder:
    ```
    cd school-payments-frontend
    ```

2. Install dependencies and start the dev server:
    ```
    npm install
    npm run dev
    ```

    Default dev server: http://localhost:5173

3. Update `src/api/client.ts` as below:

    ```
    import axios from 'axios';
    const api = axios.create({
      baseURL: 'http://127.0.0.1:3000/api',
    });
    export default api;
    ```

---

## 🧪 API Endpoints (Summary)

**Auth**
- `POST   /api/auth/register`
- `POST   /api/auth/login` → returns `access_token`

**Payments**
- `POST   /api/payments/create`
- `GET    /api/payments/status/:collect_request_id`

**Transactions**
- `GET    /api/transactions` (pagination, filters)
- `GET    /api/transactions/school/:schoolId`
- `GET    /api/transaction-status/:custom_order_id`

**Webhook**
- `POST   /api/webhook` (Cashfree / simulator sends updates)

---

## 📸 Screenshots

Place screenshots in `docs/screenshots/`