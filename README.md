# NataInData - AI-Powered Chat Application

NataInData is a modern, AI-powered chat application built with Next.js, React, and Supabase. It provides an intuitive interface for users to interact with an AI Data Tutor, with real-time message synchronization across devices.

## Features

- **AI-Powered Conversations**: Engage with a sophisticated AI Data Tutor
- **Real-time Synchronization**: Messages sync instantly across all devices
- **User Authentication**: Secure login and registration system
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark/Light Mode**: Switch between themes for comfortable viewing
- **Chat History**: Access and manage previous conversations
- **Subscription Model**: Premium features for subscribed users
- **Code Highlighting**: Proper formatting for code snippets in chat

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL database, Auth, Storage, Edge Functions)
- **State Management**: Zustand
- **AI Integration**: OpenAI API
- **Deployment**: Vercel (frontend), Supabase (backend)

## Project Structure

```
├── app/                 # Next.js app router pages and API routes
├── components/          # React components
│   ├── chatComponents/  # Chat-related components
│   ├── header/          # Header components
│   ├── modals/          # Modal components
│   ├── providers/       # Component-level providers
│   └── ui/              # Generic UI components
├── constants/           # Static data and constants
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions and API integrations
├── providers/           # App-level context providers
├── stores/              # Zustand state stores
└── supabase/            # Supabase edge functions and migrations
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account
- OpenAI API key

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/NataInData.git
   cd NataInData
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   OPENAI_API_KEY=your_openai_api_key
   ENABLE_SUPABASE_STORAGE=true
   ```

4. Run the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view the application.

### Supabase Setup

1. Create tables for chats and messages in your Supabase database
2. Set up Row Level Security policies
3. Deploy Edge Functions for chat processing:
   ```
   npx supabase functions deploy chat
   ```

## Architecture Overview

### Frontend

The application uses Next.js App Router for routing and React components for the UI. Zustand is used for state management, providing a simple and efficient way to handle application state.

### Backend

Supabase provides the backend infrastructure:
- PostgreSQL database for storing chats and messages
- Authentication for user management
- Realtime subscriptions for instant updates
- Edge Functions for serverless processing

### Chat Flow

1. User sends a message
2. Message is stored in Supabase database
3. Message is processed by OpenAI API
4. Response is streamed back to the user
5. Response is stored in Supabase database
6. Realtime subscriptions ensure all connected clients see updates instantly

## Development

### Code Style

The project uses ESLint and TypeScript for code quality. A pre-commit hook runs linting before each commit.

### Deployment

- Frontend is deployed on Vercel
- Supabase Edge Functions are deployed directly to Supabase

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [OpenAI](https://openai.com/) for the AI capabilities
- [Supabase](https://supabase.io/) for the backend infrastructure
- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
