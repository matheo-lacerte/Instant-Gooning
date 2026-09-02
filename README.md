# Game Commerce Platform

## 1) Project overview
Game Commerce Platform is a full-stack web application for browsing digital games, managing a cart, and completing secure checkout. The project combines a React + Vite frontend with an Express API connected to Supabase and Stripe.

## 2) Main features
- User registration and authentication.
- JWT-based authorization for protected routes.
- Game catalogue listing and detail pages.
- Shopping cart management (add, decrement, remove, clear).
- Order flow through Stripe Checkout.
- Stripe webhook processing for checkout completion handling.
- Supabase-backed data storage and user/account data.
- Administrative panel for adding, editing, and removing games.
- Deployment-ready structure for Vercel.

## 3) Technology stack
- Frontend: React, Vite, React Router.
- Backend: Node.js, Express.
- Auth & data: Supabase (`@supabase/supabase-js`).
- Payments: Stripe.
- Security helpers: rate limiting, input validation, bcrypt.
- Quality tools: ESLint, Vitest, Cypress.

## 4) High-level architecture
- `src/`: React client application.
- `server/`: Express API, business logic, middleware, and route handlers.
- `api/index.js`: serverless-compatible entrypoint for Vercel routing.
- `server/config/supabase.js`: Supabase client configuration (public and server-only clients).
- `server/controllers/stripeWebhookController.js`: Stripe webhook event handling.

## 5) Local installation instructions
1. Install Node.js 22+.
2. Clone the repository.
3. Install dependencies with:
   ```bash
   npm ci
   ```
4. Copy the environment template:
   ```bash
   cp .env.example .env
   ```
5. Fill `.env` with your own non-public credentials.
6. Start frontend dev server:
   ```bash
   npm run dev
   ```
7. Start backend API server in another terminal:
   ```bash
   npm run dev:server
   ```

## 6) Required environment variables (placeholders only)
### Public/runtime-safe
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SITE_URL`
- `DEFAULT_CURRENCY`
- `PORT`
- `CORS_ORIGINS`

### Server-only secrets
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `JWT_SECRET`

## 7) Available npm scripts
- `npm run dev`: start Vite dev server.
- `npm run build`: build frontend assets.
- `npm run lint`: run ESLint.
- `npm run preview`: preview built frontend.
- `npm run server`: run Express API.
- `npm run dev:server`: run Express API with nodemon.
- `npm test`: run Vitest.
- `npm run test:coverage`: run Vitest with coverage output.

## 8) Testing instructions
- Unit/component tests:
  ```bash
  npm test
  ```
- Coverage run:
  ```bash
  npm run test:coverage
  ```
- Cypress tests are present in the repository and can be executed with Cypress once the local app environment is running.

## 9) Deployment information
- The repository includes `vercel.json` rewrites for API and SPA routing.
- `api/index.js` exports the Express app for Vercel serverless execution.
- Configure all required environment variables in the Vercel project settings before deployment.

## 10) Security practices
- Keep all server-only secrets in `.env` (never in frontend code).
- Use placeholder-only values in `.env.example`.
- Never commit real credentials.
- Restrict CORS origins via `CORS_ORIGINS`.
- Use rate-limiting middleware for authentication and write operations.
- Validate sensitive changes with secret scanning before release.

## 11) Team contribution statement
This was a team project. Mathéo Lacerte was the primary contributor responsible for the Express backend, JWT authentication, Supabase integration and database work, administrative panel, Stripe integration, deployment, and part of the interface.

## 12) Possible future improvements
- Add end-to-end CI execution for Cypress flows.
- Add role-based audit logging for admin actions.
- Add stronger payment event observability and alerting.
- Improve i18n consistency across frontend and backend messages.

## Screenshot section (to add later)
No screenshots are currently included in this repository. Add production-safe screenshots here after removing personal data and sensitive identifiers.
