# Eco-Smart Deployment & Production Guide

This document provides detailed instructions for deploying Eco-Smart to production and managing the backend infrastructure.

## 🏛 Platform Independence & Self-Hosting

Eco-Smart is designed to be platform-independent. While it defaults to Supabase for its backend, it can be self-hosted or ported to any PostgreSQL-compatible environment.

### Self-Hosting with Supabase Local
For local development or private infrastructure, you can run the entire Supabase stack using Docker:

1.  **Initialize Supabase**:
    ```sh
    supabase init
    ```
2.  **Start the stack**:
    ```sh
    supabase start
    ```
3.  **Update Environment Variables**:
    Update your `.env` file with the local API URL and keys provided by the CLI.

---

## 🗄 Database & Migrations

The database schema is managed via Supabase migrations. 

### Applying Migrations
To push local changes to a production database:
```sh
supabase db push
```

### Viewing Schema
Schema definitions can be found in `supabase/migrations/`.

---

## ⚡ Edge Functions

Eco-Smart uses Supabase Edge Functions for background tasks (e.g., AI debugging, weather data sync).

### Deployment
To deploy all functions to production:
```sh
supabase functions deploy
```

### Key Functions
- `ai-debug-scheduler`: Manages periodic AI analysis.
- `real-time-weather`: Synchronizes weather data from external APIs.

---

## 🌐 Production Deployment (Frontend)

The frontend is a Vite-based React application that can be hosted on Vercel, Netlify, or any static site provider.

1.  **Build**:
    ```sh
    npm run build
    ```
2.  **Environment Variables**:
    Ensure the following secrets are set in your CI/CD pipeline:
    - `VITE_SUPABASE_URL`
    - `VITE_SUPABASE_PUBLISHABLE_KEY`
    - `VITE_GOOGLE_MAPS_API_KEY`
    - `VITE_OPENWEATHERMAP_API_KEY`

---

## 🔒 Security & Best Practices
- **RLS (Row Level Security)**: Enabled on all tables. Ensure production policies are strictly reviewed.
- **SSL**: All connections to the database and API are encrypted.
