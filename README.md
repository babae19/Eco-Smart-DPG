# Eco-Smart

Eco-Smart is a comprehensive full-stack application dedicated to environmental management, sustainability campaigns, and eco-friendly shopping. Built with a modern tech stack, it provides tools for community engagement, disaster alerts, and tracking environmental reports.

## 🚀 Features

- **Environmental Campaigns**: Create and browse campaigns focused on sustainability and environmental protection.
- **Eco-Shop**: A marketplace for sustainable and eco-friendly products.
- **Disaster Alerts & Info**: Stay informed with real-time alerts and educational resources on natural disasters.
- **Community Reports**: Feed and detail views for environmental reports from the community.
- **Admin & AI Dashboards**: Monitoring tools for administrators and AI-driven insights.
- **Help Center & Tips**: Access to environmental tips and a comprehensive help system.
- **Secure Authentication**: Integrated Supabase authentication for users and admins.

## 🛠 Tech Stack

- **Frontend**: Vite, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui, Framer Motion
- **Backend/Database**: Supabase (PostgreSQL)
- **Maps**: Google Maps API Integration
- **Mobile Support**: Capacitor (Android/iOS support)

## 📋 Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **Supabase Account**: Required for database and auth.
- **Google Maps API Key**: Required for map features.

## ⚙️ Setup Instructions

1. **Clone the repository**:
   ```sh
   git clone <repository-url>
   cd eco-smart
   ```

2. **Install dependencies**:
   ```sh
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and fill in your keys:
   ```sh
   cp .env.example .env
   ```
   Required variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_GOOGLE_MAPS_API_KEY`

4. **Start Development Server**:
   ```sh
   npm run dev
   ```

## 🏗 Build & Deploy

To create a production build:
```sh
npm run build
```

To preview the build locally:
```sh
npm run preview
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
