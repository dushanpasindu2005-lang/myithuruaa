# 1500 Savings Tracker (Next.js)

Minimal Next.js app implementing:
- Secure email/password authentication (bcrypt + JWT in HttpOnly cookie)
- MongoDB storage for user box states (per-user)
- Animated login/register pages (framer-motion)
- Responsive tracker grid (200 boxes x 1500 LKR)
- Client-side daily reminder notification with image when user didn't update today

Requirements
- Node 18+
- MongoDB connection string

Environment variables (.env.local)
```
MONGODB_URI=your_mongo_uri
JWT_SECRET=some_long_random_secret
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Install & run

```powershell
npm install
npm run dev
```

Notes on security
- Passwords are hashed with bcrypt. JWT is stored in an HttpOnly, Secure (when served over HTTPS) cookie. Ensure you serve over HTTPS in production and set secure cookie flag.

Next steps
- Add email verification and optional 2FA for higher security
- Add server push notifications (requires web push setup)
