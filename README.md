<div align="center">

# NataInData

<img src="public/logo.png" alt="NataInData Logo" width="140" height="140">

### AI-powered conversational data tutor

[![Next.js](https://img.shields.io/badge/Next.js-15.x-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.x-3ECF8E?style=flat-square&logo=supabase)](https://supabase.io/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

<a href="#features">Features</a> •
<a href="#demo">Demo</a> •
<a href="#tech-stack">Tech Stack</a> •
<a href="#getting-started">Getting Started</a> •
<a href="#deployment">Deployment</a> •
<a href="#contributing">Contributing</a>

</div>

<br />

## ✨ Features

<table>
  <tr>
    <td>
      <h3>🤖 AI-Powered Tutor</h3>
      <p>Engage with a sophisticated AI assistant specialized in data science</p>
    </td>
    <td>
      <h3>⚡ Real-time Messaging</h3>
      <p>Instant message delivery and synchronization across devices</p>
    </td>
  </tr>
  <tr>
    <td>
      <h3>🔐 Secure Auth</h3>
      <p>Authentication powered by Supabase with secure user management</p>
    </td>
    <td>
      <h3>💳 Subscription System</h3>
      <p>Premium features with Stripe payment integration</p>
    </td>
  </tr>
  <tr>
    <td>
      <h3>🌓 Dark/Light Mode</h3>
      <p>Theme switching for comfortable viewing in any environment</p>
    </td>
    <td>
      <h3>📱 Responsive Design</h3>
      <p>Optimized experience on desktop and mobile devices</p>
    </td>
  </tr>
  <tr>
    <td>
      <h3>📊 Code Highlighting</h3>
      <p>Proper syntax highlighting for code snippets in conversations</p>
    </td>
    <td>
      <h3>🔊 Voice Input</h3>
      <p>Audio processing with waveform visualization</p>
    </td>
  </tr>
</table>

<br />

## 🎮 Demo

<div align="center">
  <p><strong>See NataInData in action</strong></p>
  
  <img src="public/demo.gif" alt="NataInData Demo" width="85%" style="border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />
  
  <br />
  
  <a href="https://nata-in-data.vercel.app/new-chat">
    <img src="https://img.shields.io/badge/LIVE_DEMO-Visit_Site-FF5757?style=for-the-badge" alt="Live Demo" />
  </a>
</div>

<br />

## 🛠️ Tech Stack

<details open>
<summary><b>Frontend</b></summary>
<br>

- **Framework**: [Next.js 15](https://nextjs.org/) - React framework with App Router
- **UI Library**: [React 19](https://react.dev/) - Latest React with hooks
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) - Simple state management
- **Animations**: [Framer Motion](https://www.framer.com/motion/) - Production-ready animations
- **Code Highlighting**: [React Syntax Highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter)
- **Theme Switching**: [next-themes](https://github.com/pacocoursey/next-themes) - Theme management

</details>

<details>
<summary><b>Backend</b></summary>
<br>

- **Database & Auth**: [Supabase](https://supabase.io/) - Open source Firebase alternative
- **AI Integration**: [OpenAI](https://openai.com/) - Advanced language models
- **Real-time**: Supabase Realtime - For instant updates
- **Payments**: [Stripe](https://stripe.com/) - Subscription system

</details>

<details>
<summary><b>DevOps & Tools</b></summary>
<br>

- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Linting**: [ESLint](https://eslint.org/) - Code quality tool
- **Git Hooks**: [Husky](https://typicode.github.io/husky/) - Git hooks made easy
- **Deployment**: [Vercel](https://vercel.com/) - Frontend deployment

</details>

<br />

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account
- OpenAI API key
- Stripe account (for subscription features)

### Installation

<details>
<summary><b>1. Clone the repository</b></summary>

```bash
git clone https://github.com/your-username/NataInData.git
cd NataInData
```
</details>

<details>
<summary><b>2. Install dependencies</b></summary>

```bash
npm install
```
</details>

<details>
<summary><b>3. Set up environment variables</b></summary>

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
</details>

<details>
<summary><b>4. Run the development server</b></summary>

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.
</details>

<details>
<summary><b>5. Supabase Setup</b></summary>

1. Create a new Supabase project
2. Set up tables for chats, messages, and subscriptions
3. Configure Row Level Security (RLS) policies
4. Deploy Supabase Edge Functions:
   ```bash
   supabase functions deploy
   ```
</details>

<details>
<summary><b>6. Stripe Integration</b></summary>

Follow the instructions in the `STRIPE_INTEGRATION.md` file to set up the subscription system.
</details>

<br />

## 📁 Project Structure

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

<br />

## 🌐 Deployment

<details>
<summary><b>Frontend (Vercel)</b></summary>

```bash
vercel
```
</details>

<details>
<summary><b>Backend (Supabase)</b></summary>

1. Deploy schema changes to your Supabase project
2. Deploy Edge Functions:
   ```bash
   supabase functions deploy
   ```
</details>

<br />

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Commit your changes:
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. Push to the branch:
   ```bash
   git push origin feature/amazing-feature
   ```
5. Open a Pull Request

<br />

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

<br />

<div align="center">
  <img src="public/logo-small.png" alt="NataInData" width="40">
  <br />
  Made with ❤️ by Me
</div>
