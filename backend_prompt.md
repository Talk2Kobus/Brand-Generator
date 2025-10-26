# Backend Prompt for AI Assistant (e.g., in VS Code)

You are an expert backend developer specializing in creating secure, efficient serverless functions on Google Cloud Platform. Your task is to create a backend service for a Brand Identity Generator application.

This service will be consumed by a React frontend. The backend needs to handle user authentication, storage of generated brand identities, domain availability checks, and basic analytics.

---

### **Prompt:**

Please generate a secure, production-ready Google Cloud Function written in **Node.js with TypeScript**. This function will act as the complete backend API.

**Key Requirements:**

1.  **Framework:** Use **Express.js** to handle all API routing within the Cloud Function.
2.  **Trigger:** The function must be an **HTTP-triggered** function.
3.  **Security (Very Important):**
    -   All API keys (e.g., for Namecheap, OAuth clients) and database credentials must be stored securely using **Google Cloud Secret Manager**. Do **not** hardcode them.
    -   Implement **CORS** to only allow requests from the specific frontend domain (configurable via an environment variable).
    -   Implement user authentication using **JSON Web Tokens (JWT)**.
    -   User passwords must be **hashed** using `bcrypt`.

4.  **Database:**
    -   The backend will connect to a **PostgreSQL** database.
    -   Use a library like `pg` or an ORM like `Prisma`.
    -   The database schema should match the structure defined in `database_schema.sql`.

5.  **API Endpoints:**

    **Authentication (`/auth`)**
    -   `POST /auth/register`: Accepts `email` and `password`. Hashes password, creates a user, returns a JWT.
    -   `POST /auth/login`: Accepts `email` and `password`. Verifies credentials, returns a JWT.
    -   `POST /auth/google`: Accepts a Google ID token. Verifies the token with Google's servers, finds or creates a user associated with the Google ID, and returns a JWT.
    -   `POST /auth/facebook`: Accepts a Facebook access token. Verifies it, finds or creates a user, and returns a JWT.
    -   `GET /auth/me`: A protected endpoint that requires a JWT. Returns the currently logged-in user's data (`id`, `email`).

    **Brand Identities (`/brands`) - All protected endpoints**
    -   `POST /brands`: Accepts a JSON body containing `companyName`, `mission`, and the full `brandBible` JSON. Saves the brand identity to the database, associated with the logged-in user.
    -   `GET /brands`: Returns a list of all brand identities saved by the logged-in user (a simplified list: `id`, `companyName`, `primaryLogoUrl`, `primaryColor`).
    -   `GET /brands/:id`: Returns the full details of a single brand identity by its ID, ensuring it belongs to the logged-in user.

    **Domain Availability (`/domains`)**
    -   `POST /domains/check`: Accepts `{ "names": ["name1"], "tld": "com" }`.
    -   Uses a third-party API (e.g., **Namecheap**) to check domain availability.
    -   Returns `{ "results": [{ "domain": "name1.com", "isAvailable": true }] }`.

    **Analytics (`/analytics`)**
    -   `POST /analytics/track`: An unprotected endpoint that accepts an event payload, e.g., `{ "eventType": "BRAND_CREATED", "payload": { ... } }`. It records this event in the database.
    -   `GET /analytics/summary`: A protected endpoint that returns aggregated analytics data (e.g., total brands, most popular colors/fonts).

6.  **Dependencies:** Provide a complete `package.json` file listing all necessary dependencies (e.g., `express`, `jsonwebtoken`, `bcrypt`, `pg`, `@google-cloud/secret-manager`, `cors`, `google-auth-library`, etc.) and a `tsconfig.json`.

7.  **Error Handling:** Implement robust error handling with meaningful status codes (`400`, `401`, `404`, `500`).

Please provide the complete code for the main function file (`index.ts`), `package.json`, and `tsconfig.json`. Include comments explaining the security measures and the core logic.
