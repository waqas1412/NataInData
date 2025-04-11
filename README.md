# NataInData 

<p align="center">
  <img src="public/logo.png" alt="NataInData Logo" width="120" height="120">
</p>

<p align="center">
  A modern AI-powered conversational data tutor built with Next.js, React, and Supabase
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

## Features

- **AI-Powered Data Tutor**: Engage with a sophisticated AI assistant specialized in data science
- **Real-time Messaging**: Instant message delivery and synchronization across devices
- **Code Highlighting**: Proper syntax highlighting for code snippets in conversations
- **User Authentication**: Secure authentication with Supabase Auth
- **Subscription System**: Premium features with Stripe payment integration
- **Dark/Light Mode**: Theme switching for comfortable viewing in any environment
- **Responsive Design**: Optimized experience on desktop and mobile devices
- **Audio Processing**: Voice input support with waveform visualization

## Tech Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Code Highlighting**: [React Syntax Highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter)
- **Theme Switching**: [next-themes](https://github.com/pacocoursey/next-themes)

### Backend
- **Database & Auth**: [Supabase](https://supabase.io/)
- **API Integration**: [OpenAI](https://openai.com/)
- **Real-time**: Supabase Realtime for instant updates
- **Payments**: [Stripe](https://stripe.com/) subscription system

### Dev Tools
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Linting**: [ESLint](https://eslint.org/)
- **Git Hooks**: [Husky](https://typicode.github.io/husky/)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account
- OpenAI API key
- Stripe account (for subscription features)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/NataInData.git
   cd NataInData
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.local.example` to `.env.local` and fill in the required values:
   ```bash
   cp .env.local.example .env.local
   ```
   Required environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   OPENAI_API_KEY=your_openai_api_key
   NEXT_PUBLIC_STRIPE_PAYMENT_LINK=your_stripe_payment_link
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view the application.

### Supabase Setup

1. Create a new Supabase project
2. Set up tables for chats, messages, and subscriptions
3. Configure Row Level Security (RLS) policies
4. Deploy any Supabase Edge Functions
   ```bash
   supabase functions deploy
   ```

### Stripe Integration

Follow the instructions in the `STRIPE_INTEGRATION.md` file to set up the subscription system.

## Project Structure

```
├── app/                 # Next.js app router pages and API routes
├── components/          # React components
│   ├── chatComponents/  # Chat-related components
│   ├── header/          # Header components
│   ├── modals/          # Modal components
│   ├── ui/              # Reusable UI components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions and API clients
│   ├── supabase.ts      # Supabase client
│   ├── openai.ts        # OpenAI client
├── providers/           # React context providers
├── public/              # Static assets
├── stores/              # Zustand state stores
├── supabase/            # Supabase edge functions and config
├── types/               # TypeScript type definitions
```

## Deployment

### Frontend

The application is optimized for deployment on [Vercel](https://vercel.com/):

```bash
vercel
```

### Backend

Supabase provides all the backend infrastructure:

1. Deploy schema changes to your Supabase project
2. Deploy Edge Functions:
   ```bash
   supabase functions deploy
   ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

<p align="center">
  Made with ❤️ by Me
</p>
