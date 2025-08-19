SimpliBooks - AI-Enhanced Invoice & Expense Management 🧾✨
==========================================================

**SimpliBooks** is a full-stack web application designed to simplify financial tracking for freelancers and small businesses in India. It provides an intuitive, all-in-one platform for managing clients, creating professional GST-compliant invoices, and tracking expenses, enhanced with AI-powered features to boost productivity.

🌟 Key Features
---------------

*   **Secure Authentication:** Session-based authentication with HttpOnly refresh tokens.
    
*   **Dashboard:** An at-a-glance overview of total revenue, expenses, and net profit with data visualizations.
    
*   **Client Management:** Full CRUD (Create, Read, Update, Delete) functionality for managing clients.
    
*   **Expense Tracking:** Easily log and categorize business expenses.
    
*   **Professional Invoicing:**
    
    *   Create, manage, and track the status of invoices (Draft, Sent, Paid, Overdue).
        
    *   Add line items, taxes (GST), and custom notes.
        
    *   Generate and download invoices as professional PDF documents.
        
*   **🤖 AI-Powered Features:**
    
    *   **Email Composer:** Instantly generate professional emails for sending invoices and payment reminders.
        
    *   **Smart Categorization:** Automatically suggests expense categories based on the description.
        

🛠️ Technology Stack
--------------------

This project is built using the MERN stack and other modern technologies.

*   **Frontend:**
    
    *   [React.js](https://reactjs.org/)
        
    *   [React Router](https://reactrouter.com/) for client-side routing
        
    *   [Axios](https://axios-http.com/) for API requests
        
    *   [Tailwind CSS](https://tailwindcss.com/) for styling
        
*   **Backend:**
    
    *   [Node.js](https://nodejs.org/)
        
    *   [Express.js](https://expressjs.com/) for the REST API
        
    *   [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) for the database
        
    *   JWT & Cookies for session-based authentication
        
*   **APIs & Libraries:**
    
    *   [Google Gemini API](https://ai.google.dev/) for generative AI features
        
    *   [jsPDF](https://github.com/parallax/jsPDF) for PDF generation
        
    *   [Chart.js](https://www.chartjs.org/) for data visualization
        

🚀 Getting Started
------------------

To get a local copy up and running, follow these simple steps.

### Prerequisites

You need to have Node.js and npm installed on your machine.

*   [Node.js](https://nodejs.org/) (which includes npm)
    

### Installation & Setup

1.  git clone https://github.com/\[YOUR\_GITHUB\_USERNAME\]/simplibooks-app.gitcd simplibooks-app
    
2.  \# Navigate to the backend foldercd backend# Install NPM packagesnpm install# Create a .env file in the backend folder and add the required environment variables (see .env.example)touch .env# Start the servernpm start
    
3.  \# Navigate to the frontend folder from the root directorycd frontend# Install NPM packagesnpm install# Create a .env file in the frontend folder and add the required environment variablestouch .env# Start the clientnpm run dev
    

⚙️ Environment Variables
------------------------

To run this project, you will need to add the following environment variables to your .env files.

**backend/.env.example**

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   MONGO_URI=your_mongodb_connection_string  PORT=5000  ACCESS_TOKEN_SECRET=your_super_secret_access_token_key  REFRESH_TOKEN_SECRET=your_super_secret_refresh_token_key  GEMINI_API_KEY=your_google_gemini_api_key   `

**frontend/.env.example**

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   VITE_API_URL=http://localhost:5000   `

📝 API Endpoints
----------------

The backend provides the following RESTful API endpoints. All protected routes require authentication.

Click to view API Endpoints

#### **Authentication**

*   POST /api/auth/register - Creates a new user account.
    
*   POST /api/auth/login - Authenticates a user, returns an Access Token, and sets a Refresh Token cookie.
    
*   POST /api/auth/refresh - Issues a new Access Token using a valid Refresh Token.
    
*   POST /api/auth/logout - Logs the user out by deleting their Refresh Token from the server.
    

#### **Users**

*   GET /api/users/me - Retrieves the profile of the currently logged-in user.
    
*   PATCH /api/users/me - Updates the profile details of the logged-in user.
    
*   PATCH /api/users/me/password - Allows the logged-in user to change their password.
    

#### **Organizations**

*   POST /api/organizations - Creates a new business/organization for the user.
    
*   GET /api/organizations/mine - Retrieves the organization details for the logged-in user.
    
*   PATCH /api/organizations/mine - Updates the user's organization details and settings.
    

#### **Clients**

*   POST /api/clients - Adds a new client to the user's organization.
    
*   GET /api/clients - Retrieves a list of all clients for the organization.
    
*   GET /api/clients/:id - Retrieves a single client by their ID.
    
*   PATCH /api/clients/:id - Updates a specific client's details.
    
*   DELETE /api/clients/:id - Archives a client (soft delete).
    

#### **Invoices**

*   POST /api/invoices - Creates a new invoice for a client.
    
*   GET /api/invoices - Retrieves all invoices for the organization.
    
*   GET /api/invoices/:id - Retrieves a single invoice by its ID.
    
*   PATCH /api/invoices/:id - Updates an invoice (e.g., changes its status).
    

#### **Expenses**

*   POST /api/expenses - Logs a new expense for the organization.
    
*   GET /api/expenses - Retrieves all expenses for the organization.
    
*   PATCH /api/expenses/:id - Updates an existing expense record.
    
*   DELETE /api/expenses/:id - Permanently deletes an expense record.
    

#### **AI**

*   POST /api/ai/generate-email - Generates email content for an invoice using AI.
    
*   POST /api/ai/suggest-category - Suggests a category for an expense based on its description.
    

👤 Author
---------

**Ishmeet Singh**

*   GitHub: [@Ishmeet1202](https://github.com/ishmeet1202)
    
*   LinkedIn: [Ishmeet Singh](https://www.linkedin.com/in/ishmeet-singh-9b80b6321/)