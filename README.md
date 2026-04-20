# Eco-Smart

Eco-Smart is a comprehensive full-stack application dedicated to environmental management, sustainability campaigns, and eco-friendly shopping. Built with a modern tech stack, it provides tools for community engagement, disaster alerts, and tracking environmental reports.

## 🚀 Features

- **Environmental Campaigns**: Create and browse campaigns focused on sustainability and environmental protection.
- **Eco-Shop**: A marketplace for sustainable and eco-friendly products.
- **Disaster Alerts & Info**: Stay informed with real-time alerts and educational resources on natural disasters.
- **Community Reports**: Feed and detail views for environmental reports from the community.
- **Admin & AI Dashboards**: Monitoring tools for administrators and AI-driven insights.
- **Help Center & Tips**: Access to environmental tips and a comprehensive help system.
- **Mobile Support**: Capacitor integration for Android and iOS.
- **Data Portability**: Users can export their data and manage their privacy settings locally.

## 🏗 Architecture & Technical Design

### Frontend
- **React + Vite**: Fast, modern development environment.
- **TypeScript**: Type-safe development for enterprise scalability.
- **Tailwind CSS + shadcn/ui**: Premium UI components with a consistent design system.
- **Framer Motion**: Smooth micro-animations and transitions.
- **TanStack Query**: Efficient data fetching, caching, and state management.

### Backend & Infrastructure
- **Supabase (PostgreSQL)**: Scalable relational database with real-time capabilities.
- **Authentication**: Secure RBAC (Role-Based Access Control) via Supabase Auth.
- **Storage**: Media handling for campaign and report images.
- **Edge Functions**: (Optional) For background processing and server-side logic.

### External Integrations
- **Google Maps API**: Geographic visualization and location tracking.
- **OpenWeatherMap API**: Real-time weather data and disaster alerts.
- **Capacitor**: Native bridge for mobile platform independence.

## ⚙️ Development Setup

### Prerequisites
- **Node.js**: v18.0.0+
- **npm**: v9.0.0+
- **Supabase CLI**: For local development (recommended)

### Installation
1.  **Clone the repository**:
    ```sh
    git clone <repository-url>
    cd eco-smart
    ```
2.  **Install dependencies**:
    ```sh
    npm install
    ```
3.  **Environment Configuration**:
    Create a `.env` file from `.env.example`:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
    VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
    VITE_OPENWEATHERMAP_API_KEY=your_weather_key
    ```

### Running Locally
```sh
npm run dev
```

## 🧪 Testing & Quality Assurance
The project uses **Vitest** for unit and integration testing.
- Run all tests: `npm test`
- watch mode: `npm run test:watch`

## 📄 License
Copyright (c) 2026 Eco-Smart Contributors. Licensed under the [MIT License](LICENSE).
