# Smart Secure Campus - Frontend Dashboard

Next.js-based real-time dashboard for Smart Access Control System with face recognition, access logs, alerts, and analytics.

## Features
- Real-time access logs & alerts via Socket.io
- Admin dashboard (user/face management)
- Analytics & access history
- Device/camera monitoring
- Member management
- Responsive UI with Tailwind CSS
- Real-time notifications

## Prerequisites
- Node.js 18+
- Backend API running (smart-access-backend)
- AI Worker running (for face recognition)

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create `.env.local` in the root:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure
```
src/
├── app/              # Next.js app routes (auth, dashboard, login)
├── components/       # React components (dashboard, charts, UI)
├── hooks/            # Custom React hooks
├── context/          # Context providers (Socket.io)
├── lib/              # Utilities & helpers
└── types/            # TypeScript types
```

## Key Components
- **Dashboard**: Real-time logs, alerts, analytics
- **SocketProvider**: Manages Socket.io connection for live updates
- **Charts**: Analytics visualizations (Radar, access metrics)
- **Auth**: Login & JWT token management

## API Integration
Connects to backend API (`smart-access-backend`) for:
- User authentication
- Access logs & alerts
- Member & device management
- Face image uploads

## Build for Production
```bash
npm run build
npm start
```

## Scripts
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Technologies
- Next.js 14+
- React 18+
- TypeScript
- Tailwind CSS
- Socket.io Client
- Axios/Fetch for API calls
