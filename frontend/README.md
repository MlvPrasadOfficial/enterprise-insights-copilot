# DEMO SYNC LINE - 2025-06-07
# Enterprise Insights Copilot - Next.js Frontend

This is the frontend for the Enterprise Insights Copilot project. It provides a dashboard for CSV upload, chat, agent timeline, charting, and configuration panel. The frontend is built with Next.js, Tailwind CSS, and shadcn/ui for modern, production-grade UI components.

## Features aaaa

- CSV file upload to backend
- Chat interface with multi-agent backend
- Agent timeline visualization
- Chart panel for data insights
- Configurable settings panel

## Project Structure

- `app/` - Main Next.js App Router pages and layout
- `components/` - React UI components (FileUploader, ChatBox, AgentTimeline, ChartPanel, SettingsPanel)
- `public/` - Static assets
- `utils/` - Utility functions

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. The app runs at http://localhost:3000

## Environment Variables

- `NEXT_PUBLIC_BACKEND_URL` - URL of the backend API (default: http://localhost:8000)

## Deployment

- Deploy to Vercel for production hosting.

---

For more backend and agent details, see the main project README.
