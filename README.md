# APEXVENDOR - Premium Vendor Management & Intelligence Platform

**APEXVENDOR** is a state-of-the-art vendor management platform built with **Next.js 16**, designed to streamline the interaction between administrators and service providers. It features a high-performance **AI Intelligence Terminal** powered by Google Gemini, capable of analyzing documents (PDFs) and assisting with complex queries.

The platform emphasizes a premium user experience with a sophisticated design system, robust security, and efficient data handling.

---

## 🚀 Key Features

### 🧠 Apex Intelligence Terminal (AI Chat)

- **Multimodal AI:** Powered by **Google Gemini Flash**.
- **PDF Analysis:** Upload PDF documents (like tender documents or invoices) for instant summarization and analysis.
- **Smart Assistance:** Ask questions about your data, generate reports, or get insights on vendor capabilities.
- **Context-Aware:** Maintains chat history for fluid conversations.

### 🏢 Vendor Management (Admin)

- **Comprehensive Directory:** View all registered service providers in a searchable, sortable table.
- **Account Auditing:** Monitor account status and profile details.
- **Management Actions:** Administrators can delete or modify vendor accounts directly from the dashboard.
- **Real-time Updates:** Uses Next.js Server Actions for instant data reflection.

### 👤 Profile System

- **Detailed Profiles:** users can manage their corporate identity, contact info, and services.
- **Secure Access:** Role-based redirection ensures users only see what they are authorized to access.

### 🔐 Security & Architecture

- **Role-Based Access Control (RBAC):** Distinct flows for Administrators and Vendors.
- **Secure Authentication:** Powered by custom implementation using `bcryptjs` and secure sessions.
- **Modern Tech Stack:** Utilizes the latest React Server Components (RSC) and Server Actions.

---

## 🛠️ Technology Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) (with custom premium theme)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **AI Engine:** [Google Gemini Generative AI](https://ai.google.dev/)
- **PDF Processing:** `pdf2json`
- **Markdown Rendering:** `react-markdown` + `remark-gfm`

---

## ⚡ Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** Database
- **Gemini API Key** (for AI features)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/apexvendor.git
    cd apexvendor
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root directory and add the following variables:

    ```env
    # Database Connection
    DATABASE_URL="postgresql://user:password@localhost:5432/apexvendor?schema=public"

    # AI Configuration
    GEMINI_API_KEY="your_google_gemini_api_key"

    # Other configurations (if applicable)
    NEXT_PUBLIC_APP_URL="http://localhost:3000"
    ```

4.  **Database Migration:**
    Push the Prisma schema to your database:

    ```bash
    npx prisma migrate dev --name init
    ```

5.  **Run the Development Server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📂 Project Structure

```
├── app/                  # Next.js App Router pages & layouts
│   ├── dashboard/        # Protected routes (Chat, Vendors, Profile)
│   ├── login/            # Authentication pages
│   └── api/              # API routes (if any)
├── components/           # Reusable UI components
├── lib/                  # Utilities (DB connection, Gemini client)
├── prisma/               # Database schema
├── public/               # Static assets
└── services/             # Business logic & Server Actions
```

## 🤝 Contribution

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
