# Backend Prompt for AI Assistant (e.g., in VS Code)

You are an expert backend developer specializing in creating secure, efficient serverless functions on Google Cloud Platform. Your task is to create a backend service that checks domain name availability.

This service will be consumed by a React frontend. The frontend needs to check if a list of potential business names are available as `.com`, `.co.za`, `.com.na`, or other TLDs.

---

### **Prompt:**

Please generate a secure, production-ready Google Cloud Function written in **Node.js with TypeScript**.

This function will serve as an API proxy for checking domain name availability.

**Key Requirements:**

1.  **Framework:** Use **Express.js** to handle routing within the Cloud Function.
2.  **Trigger:** The function must be an **HTTP-triggered** function.
3.  **Endpoint:** It should expose a single `POST` endpoint at `/check-domains`.
4.  **Input:** The endpoint should accept a JSON body with the following structure:
    ```json
    {
      "names": ["mycoolbusiness", "anothergreatidea"],
      "tld": "com"
    }
    ```
    -   `names`: An array of domain names (without the TLD).
    -   `tld`: The top-level domain to check (e.g., "com", "co.za").
5.  **Core Logic:**
    -   The function will use a third-party domain availability API to perform the actual checks. For this implementation, please use the **Namecheap API**. Assume the developer can get their own API key.
    -   Construct the full domain names (e.g., `mycoolbusiness.com`).
    -   Use the `namecheap.domains.check` method. You can use the `namecheap-sdk` npm package for this.
6.  **Security (Very Important):**
    -   The Namecheap API key and username must be stored securely using **Google Cloud Secret Manager**. Do **not** hardcode them.
    -   The function should include logic to fetch these secrets at runtime.
    -   Implement **CORS** to only allow requests from the specific frontend domain. Make the allowed origin configurable via an environment variable.
    -   Add basic input validation to ensure `names` is an array of strings and `tld` is a string.
7.  **Output:** The function should return a JSON response with the following structure:
    ```json
    {
      "results": [
        { "domain": "mycoolbusiness.com", "isAvailable": true },
        { "domain": "anothergreatidea.com", "isAvailable": false }
      ]
    }
    ```
8.  **Dependencies:** Provide a complete `package.json` file listing all necessary dependencies (e.g., `express`, `@google-cloud/secret-manager`, `namecheap-sdk`, `cors`, etc.) and a `tsconfig.json` for the TypeScript configuration.
9.  **Error Handling:** Implement robust error handling. If the Namecheap API fails or secrets cannot be accessed, return a meaningful `500` status code with a generic error message.

Please provide the complete code for the main function file (`index.ts`), `package.json`, and `tsconfig.json`. Include comments explaining the security measures and the core logic.