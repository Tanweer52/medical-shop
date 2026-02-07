# Medical Shop POS (Shopkeeper-focused)

This is a Next.js scaffold focused on shopkeeper workflows: fast POS, inventory management, expiry tracking, and bulk medicine entry.

UI notes:
- Premium glossy theme with glass cards, gradient header, and glossy action buttons — optimized for quick workflows and high information density.
- Keyboard-first search (Ctrl+K) and instant stock view in results.

Run locally:

```powershell
cd c:\ms_work\medical-shop-shopkeeper
npm install
npm run dev
```

Developer notes:
- The app uses mocked API routes in `pages/api/medicines.ts`. Replace the mock with a MongoDB-backed API by implementing a data access layer and using environment variables for connection strings.
- Recommended production stack: Next.js API routes or a small Express service, MongoDB Atlas, and Redis for caching frequent counts.
Pages:
- / - Dashboard (Command Center)
 - /search - Advanced search (Ctrl+K)
