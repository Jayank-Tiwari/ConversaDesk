# ConversaDesk ⚡

**ConversaDesk** is an enterprise-grade, AI-powered Customer Intelligence and Helpdesk Platform. It automatically ingests customer emails, categorizes them using Azure OpenAI, cross-references them with a RAG (Retrieval-Augmented Generation) Knowledge Base, and provides intelligent tools for IT and Support agents to resolve issues faster than ever.

---

## 🌟 Key Features & How to Use Them

### 1. Automated AI Email Processing
* **What it does:** A background scheduler connects to an IMAP inbox every 60 seconds. Incoming emails are processed by Azure OpenAI to determine priority, sentiment, and the correct routing department.
* **How to use it:** Send an email to the configured support inbox. Wait up to 60 seconds, or click the **"Sync Gmail"** button on the `/mails` page to force an immediate fetch. The email will automatically appear as an actionable Support Ticket in your dashboard.

### 2. RAG Knowledge Base & Auto-Resolution
* **What it does:** Uses `LangChain`, `ChromaDB`, and HuggingFace Embeddings (`all-MiniLM-L6-v2`) to maintain a localized vector database of historical support context and PDF manuals.
* **How to use it:** 
  1. On the **Tickets** page, click the purple **Magic Wand** icon on any ticket row. 
  2. The system queries the RAG database and instantly drafts a highly accurate, context-aware resolution.
  3. Click "Copy Resolution" to use it.
  4. **Settings:** You can manually rebuild your Knowledge Base by navigating to the **Settings** page > **AI Configuration** tab and clicking "Rebuild Knowledge Base".

### 3. Similar Ticket Discovery
* **What it does:** Uses AI embeddings (HuggingFace) to automatically compute cosine similarity between an active ticket and all historically resolved tickets.
* **How to use it:** 
  1. Open the **Edit Ticket** modal via the 3-dots menu on a ticket row.
  2. Click **"Similar Past Tickets"** at the bottom left.
  3. A modal will instantly display the top 3 most similar past tickets, showing exactly how closely they match (e.g., "85% Match").

### 4. Knowledge Base Article Generator
* **What it does:** When an agent resolves a ticket, the AI acts as a technical writer, automatically drafting a professional Markdown Knowledge Base (KB) article based on the issue and its resolution.
* **How to use it:** 
  1. Once a ticket is marked as **Resolved** in the Edit Ticket modal, a **"Generate KB Article"** button appears.
  2. Click it, and the AI drafts the article in the background.
  3. A notification badge will appear on the **KB Drafts (FileText icon)** in the top right Navbar.
  4. Click the icon to review the draft, and click **"Upload"** to instantly save it to the RAG database, automatically hot-reloading the vector store so future AI queries can use it.

### 5. Intelligent Chat Assistant (SQL + Email Agent)
* **What it does:** An integrated AI Chatbot that serves as an omniscient sidekick for support agents. It acts as both a SQL generator and an Email drafter.
* **How to use it:** Navigate to the **AI Chat** page and type natural language commands.
  * **Database Queries:** Ask *"How many critical tickets are open?"* or *"Which department has the most negative sentiment?"*
  * **Ticket Manipulation:** Ask *"Change the priority of TICK-1234 to High"* or *"Move TICK-1234 to the Billing department."* The AI will generate and safely execute the SQL to update the database.
  * **Drafting Emails:** Ask *"Draft an email to the customer of TICK-1234 saying we fixed their issue."*
  * **Sending Emails:** After the AI drafts an email, simply type *"Yes send it"* or *"Proceed"*, and the AI will connect to the Gmail API and literally send the email on your behalf.

### 6. Comprehensive Ticket Management (UI)
* **What it does:** Provides a modern table interface to view, filter, edit, and delete tickets.
* **How to use it:** 
  * Click the **New Ticket** button in the top right to manually log a ticket.
  * Click the **3-Dots (Kebab) Menu** at the end of any ticket row to open a dropdown.
  * Click **Edit Ticket** to open a modal and manually update the Customer, Summary, Priority, Department, or Status.
  * Click **Delete** to permanently remove a ticket.
  * *All actions trigger real-time UI updates without page reloads.*

### 7. Profile & Settings Management
* **What it does:** Allows users to manage their workspace, profile, and AI configurations.
* **How to use it:** Click the avatar in the top right navbar to open the user menu. Click **Profile** to be taken directly to the Profile tab in Settings, where you can view your Avatar, Name, Email, and Role.

### 8. Real-Time WebSockets
* **What it does:** Live updates are pushed to the frontend via WebSockets. When the background job processes a new email into a ticket, agents immediately receive a toast notification without refreshing the page.

### 9. Analytics & Reporting
* **What it does:** Dynamic dashboards showing SLA metrics, resolution times, and ticket volumes.
* **How to use it:** Navigate to the **Analytics** page. You can also click **Export CSV** on the Tickets page for enterprise reporting.

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: React.js (Vite)
- **Styling**: Vanilla CSS (Premium Glassmorphic UI design system, no Tailwind)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Data Visualization**: Recharts
- **Markdown Rendering**: React-Markdown & Remark-GFM

### **Backend**
- **Framework**: FastAPI (Python)
- **Database**: SQLite (managed via SQLAlchemy ORM)
- **Background Jobs**: APScheduler
- **AI & ML Orchestration**: LangChain
- **LLM Provider**: Azure OpenAI
- **Vector Database**: ChromaDB (Local RAG)

---

## 🚀 Getting Started (How to Run)

### Prerequisites
- Python 3.9+
- Node.js 18+
- An Azure OpenAI instance (API Key, Endpoint, Deployment Name, API Version)
- A Gmail account with an App Password (for IMAP ingestion and SMTP sending)

### 1. Backend Setup
Navigate to the `backend/` directory:
```bash
cd backend

# Create a virtual environment (optional but recommended)
python -m venv tenv
source tenv/Scripts/activate  # On Windows

# Install dependencies
pip install -r requirement.txt

# Configure Environment Variables
# Create a .env file in the backend/ directory with the following keys:
# EMAIL_USER=your_email@gmail.com
# EMAIL_APP_PASSWORD=your_app_password
# AZURE_OPENAI_API_KEY=your_azure_key
# AZURE_OPENAI_ENDPOINT=https://your-endpoint.openai.azure.com/
# AZURE_OPENAI_API_VERSION=2024-02-01
# AZURE_OPENAI_DEPLOYMENT=your_model_deployment_name

# Add Google API Credentials (for Email Sending & Fetching via OAuth2)
# Ensure you place your `credentials.json` and `token.json` files directly inside the `backend/` directory.
# These files are used by the Google API Client and are ignored by git to protect your secrets.

# Start the FastAPI Server
uvicorn app.main:app --reload
```
*Note: The backend runs on `http://127.0.0.1:8000`. The background AI scheduler will start automatically.*

### 2. Frontend Setup
Navigate to the `conversadesk/` directory:
```bash
cd ../conversadesk

# Install dependencies
npm install

# Start the React development server
npm run dev
```
*Note: The frontend typically runs on `http://localhost:5173`. Authentication is currently mocked with dummy credentials (e.g., `manager@conversadesk.ai` / `123456`).*

---

## 📂 Project Structure

```text
ConversaDesk/
├── backend/
│   ├── app/
│   │   ├── models/           # SQLAlchemy DB Models (Ticket, Email, User, etc.)
│   │   ├── routes/           # FastAPI Endpoints (/chat, /ticket-resolve, etc.)
│   │   ├── services/         # Business Logic (AI processing, RAG, SQL Agent)
│   │   ├── database.py       # SQLite Connection
│   │   ├── main.py           # FastAPI Entrypoint & Router Includes
│   │   ├── seed.py           # DB Seeding Script
│   │   └── websocket_manager.py # Real-Time WS Connections
│   ├── docs/                 # PDF and Markdown files for RAG Vector ingestion
│   ├── .env                  # Environment Variables
│   ├── credentials.json      # Google API OAuth2 Credentials (add manually)
│   ├── token.json            # Google API OAuth2 Token (add manually)
│   └── requirement.txt       # Python Dependencies
│
└── conversadesk/
    ├── src/
    │   ├── components/       # Reusable React UI (Sidebar, Navbar, Modals)
    │   ├── context/          # React Contexts (AuthContext, WebSocketContext)
    │   ├── pages/            # View Containers (ChatPage, TicketsPage, SettingsPage, etc.)
    │   ├── utils/            # Helper functions (API_BASE, formatting, CSV export)
    │   ├── App.jsx           # Main Router
    │   ├── index.css         # Global Glassmorphic Design System
    │   └── main.jsx          # React Entrypoint
    └── package.json          # Node Dependencies
```
