# Office QR Complaint Management System

A full-stack system for a single office: visitors scan a QR code, land on a
mobile-friendly form, and submit a complaint with a name, optional mobile
number, and a required photo. Admins log in to a dashboard to view, search,
filter, update, and manage all complaints.

---

## 1. Folder Structure

```
qr-complaint-system/
├── backend/
│   ├── config/
│   │   └── db.js                 # MySQL connection pool
│   ├── controllers/
│   │   ├── authController.js     # Admin login logic
│   │   └── complaintController.js# Complaint CRUD logic
│   ├── middleware/
│   │   ├── auth.js               # JWT verification middleware
│   │   └── upload.js             # Multer image upload config
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── complaintRoutes.js
│   ├── utils/
│   │   ├── generateQR.js         # QR code generation
│   │   └── seedAdmin.js          # CLI script to create/reset admin
│   ├── sql/
│   │   └── schema.sql            # Database schema
│   ├── uploads/                  # Uploaded complaint images (created at runtime)
│   ├── .env.example
│   ├── package.json
│   └── server.js                 # App entry point
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js          # Configured Axios instance
│   │   ├── components/
│   │   │   ├── ComplaintTable.js
│   │   │   ├── StatusBadge.js
│   │   │   └── ProtectedRoute.js
│   │   ├── pages/
│   │   │   ├── ComplaintForm.js  # Public page (QR target)
│   │   │   ├── AdminLogin.js
│   │   │   └── AdminDashboard.js
│   │   ├── App.js                # Routes
│   │   ├── index.js
│   │   └── index.css
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── README.md                     # This file
```

---

## 2. Prerequisites

- Node.js 18+ and npm
- MySQL 8+ (or MariaDB 10.5+)
- A domain or server if deploying publicly (for the QR code to be scannable
  from outside your local network)

---

## 3. Local Setup

### 3.1 Database

```bash
mysql -u root -p < backend/sql/schema.sql
```

This creates the `complaint_system` database with `complaints` and `admins`
tables. It does **not** insert a default admin — you'll create one securely
in the next step.

### 3.2 Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set DB_PASSWORD, JWT_SECRET, PUBLIC_APP_URL, etc.

npm install

# Create your first admin account (password must be 8+ characters)
node utils/seedAdmin.js admin "YourStrongPassword123!"

# Start the server
npm run dev      # with nodemon, auto-restarts on change
# or
npm start
```

The API will run at `http://localhost:5000`.

### 3.3 Frontend

```bash
cd frontend
cp .env.example .env
# Edit .env if your backend isn't on localhost:5000

npm install
npm start
```

The app opens at `http://localhost:3000`.

- Public complaint form: `http://localhost:3000/`
- Admin login: `http://localhost:3000/admin/login`

### 3.4 Generate the QR Code

Two options:

1. **From the Admin Dashboard** — log in and click "Show QR Code" to view
   and screenshot/print it (it always points to `PUBLIC_APP_URL`).
2. **From the command line** — generates a PNG file on disk:
   ```bash
   cd backend
   node utils/generateQR.js
   # Output: backend/uploads/qr/complaint-form-qr.png
   ```

Print the QR code and place it around the office. Scanning it opens
`PUBLIC_APP_URL` (your frontend's public URL), which loads `ComplaintForm.js`.

---

## 4. API Documentation

Base URL: `http://localhost:5000/api` (or your deployed domain)

All protected routes require header: `Authorization: Bearer <token>`

### 4.1 Auth

| Method | Endpoint            | Auth | Description                     |
|--------|----------------------|------|----------------------------------|
| POST   | `/auth/login`         | No   | Log in and receive a JWT         |
| GET    | `/auth/verify`        | Yes  | Verify the current token is valid|

**POST `/auth/login`**
```json
// Request
{ "username": "admin", "password": "YourStrongPassword123!" }

// Response 200
{
  "success": true,
  "message": "Login successful.",
  "token": "eyJhbGciOi...",
  "admin": { "id": 1, "username": "admin" }
}
```

### 4.2 Complaints

| Method | Endpoint                       | Auth | Description                                  |
|--------|---------------------------------|------|-----------------------------------------------|
| POST   | `/complaints`                   | No   | Submit a new complaint (multipart/form-data)  |
| GET    | `/complaints`                   | Yes  | List complaints (search, filter, paginate)    |
| GET    | `/complaints/:id`                | Yes  | Get a single complaint                        |
| PATCH  | `/complaints/:id/status`         | Yes  | Update complaint status                       |
| GET    | `/complaints/:id/download`       | Yes  | Download the complaint's image                |
| DELETE | `/complaints/:id`                | Yes  | Delete a complaint (and its image)            |

**POST `/complaints`** (multipart/form-data)
| Field           | Type   | Required |
|-----------------|--------|----------|
| `name`          | text   | Yes      |
| `mobile_number` | text   | No       |
| `image`         | file   | Yes      |

```json
// Response 201
{
  "success": true,
  "message": "Your complaint has been submitted successfully.",
  "complaintId": 42
}
```

**GET `/complaints`** — query params: `search`, `status` (`Pending` /
`In Progress` / `Resolved`), `page` (default 1), `limit` (default 20, max 100)

```json
// Response 200
{
  "success": true,
  "data": [
    {
      "id": 42,
      "name": "Priya Sharma",
      "mobile_number": "9876543210",
      "image_path": "/uploads/171999-abc123.jpg",
      "status": "Pending",
      "created_at": "2026-07-10T09:15:00.000Z",
      "updated_at": "2026-07-10T09:15:00.000Z"
    }
  ],
  "pagination": { "total": 1, "page": 1, "limit": 20, "totalPages": 1 }
}
```

**PATCH `/complaints/:id/status`**
```json
// Request
{ "status": "In Progress" }

// Response 200
{ "success": true, "message": "Status updated successfully." }
```

**GET `/complaints/:id/download`** — streams the image file as an
attachment (`Content-Disposition: attachment`).

**DELETE `/complaints/:id`**
```json
{ "success": true, "message": "Complaint deleted successfully." }
```

### 4.3 Misc

| Method | Endpoint      | Auth | Description                              |
|--------|----------------|------|--------------------------------------------|
| GET    | `/qrcode`       | No   | Returns a base64 PNG data URL of the QR code |
| GET    | `/health`       | No   | Health check                              |

All error responses follow: `{ "success": false, "message": "..." }`.

---

## 5. Security Notes

- Passwords are hashed with **bcrypt** (10 salt rounds) — never stored in
  plain text.
- Admin routes are protected by **JWT** verification middleware.
- Uploaded files are restricted to image MIME types and capped at 5MB;
  filenames are randomized server-side to prevent path traversal or
  collisions.
- Set a long, random `JWT_SECRET` in production — never reuse the example.
- Change the seeded admin password immediately after first login by
  re-running `node utils/seedAdmin.js <username> <newPassword>`.
- Consider adding rate limiting (e.g. `express-rate-limit`) on
  `/api/auth/login` and `/api/complaints` (public POST) before going live,
  to reduce brute-force and spam risk.

---

## 6. Deployment

### Option A — VPS (Ubuntu, recommended for full control)

1. **Provision the server**
   ```bash
   sudo apt update && sudo apt install -y nodejs npm mysql-server nginx
   sudo npm install -g pm2
   ```

2. **Set up MySQL**
   ```bash
   sudo mysql_secure_installation
   mysql -u root -p < backend/sql/schema.sql
   ```

3. **Deploy backend**
   ```bash
   git clone <your-repo> /var/www/qr-complaint-system
   cd /var/www/qr-complaint-system/backend
   cp .env.example .env   # fill in production values, PUBLIC_APP_URL = https://yourdomain.com
   npm install --production
   node utils/seedAdmin.js admin "YourStrongPassword123!"
   pm2 start server.js --name complaint-backend
   pm2 save
   pm2 startup   # follow the printed instructions to enable on boot
   ```

4. **Build and deploy frontend**
   ```bash
   cd ../frontend
   cp .env.example .env   # REACT_APP_API_URL=https://api.yourdomain.com/api
   npm install
   npm run build
   # Copy the build/ folder to your web root, e.g.:
   sudo cp -r build/* /var/www/html/complaint-frontend/
   ```

5. **Configure Nginx** (reverse proxy for the API + serve the static frontend)
   ```nginx
   # /etc/nginx/sites-available/complaint-system
   server {
       listen 80;
       server_name yourdomain.com;

       # Frontend static files
       root /var/www/html/complaint-frontend;
       index index.html;
       location / {
           try_files $uri /index.html;
       }

       # Backend API reverse proxy
       location /api/ {
           proxy_pass http://localhost:5000/api/;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }

       # Serve uploaded images directly through the backend
       location /uploads/ {
           proxy_pass http://localhost:5000/uploads/;
       }
   }
   ```
   ```bash
   sudo ln -s /etc/nginx/sites-available/complaint-system /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```

6. **Enable HTTPS** (required — the QR code page requests camera access on
   mobile, which most browsers only allow over HTTPS)
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

7. **Update env files** with the final HTTPS URLs (`PUBLIC_APP_URL`,
   `REACT_APP_API_URL`, `CORS_ORIGIN`), rebuild the frontend, and restart:
   ```bash
   pm2 restart complaint-backend
   ```

8. **Print the QR code** — visit the admin dashboard on the live domain,
   click "Show QR Code," and print it.

### Option B — Shared Hosting (cPanel-style, Node.js app support)

Many shared hosts (e.g. cPanel with "Setup Node.js App") support this
pattern:

1. Create a MySQL database and user through the hosting control panel;
   import `backend/sql/schema.sql` via phpMyAdmin.
2. Upload the `backend/` folder, set environment variables in the
   Node.js App interface (matches `.env.example`), and set the startup
   file to `server.js`. Run `npm install` and then
   `node utils/seedAdmin.js <username> <password>` via the host's terminal.
3. Run `npm run build` for the frontend locally (or in a CI step) and
   upload the contents of `frontend/build/` to `public_html/` (or a
   subdomain's document root).
4. Point `REACT_APP_API_URL` (baked in at build time) to your backend's
   public URL, e.g. `https://api.yourdomain.com/api`, and rebuild before
   uploading.
5. Ensure the host allows persistent Node processes (some shared plans
   sleep idle apps — a VPS is more reliable for a 24/7 office tool).

---

## 7. Default Admin Credentials

There is **no default password** — you must create the first admin with:

```bash
node utils/seedAdmin.js <username> <password>
```

Run this again with the same username to reset a forgotten password.

---

## 8. Tech Stack Summary

- **Frontend:** React.js, React Router, Tailwind CSS, Axios
- **Backend:** Node.js, Express.js, Multer, JWT (`jsonwebtoken`), bcrypt
- **Database:** MySQL (via `mysql2`)
- **QR Code:** `qrcode` npm package (generated server-side)
