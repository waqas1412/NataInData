# NataInData - Supabase-Powered Chat Application

## Architecture Overview

This project has been migrated to use Supabase as the primary backend, reducing dependency on Next.js API routes and Vercel hosting. The architecture now leverages Supabase's powerful features:

- **Authentication**: Supabase Auth for user management
- **Database**: PostgreSQL for data storage with Row-Level Security
- **Realtime**: Supabase Realtime for live chat updates
- **Edge Functions**: Serverless functions for API endpoints
- **PostgreSQL Functions**: Database-level business logic

## Key Components

### Supabase Edge Functions

- `/supabase/functions/chat/index.ts`: Handles chat message streaming from OpenAI

### PostgreSQL Functions

- `/supabase/migrations/20240328000001_create_postgres_functions.sql`: Contains database functions for chat operations:
  - `create_chat`: Creates a new chat with initial message
  - `add_message_to_chat`: Adds messages to existing chats
  - `get_user_chats`: Retrieves all chats for a user
  - `delete_chat`: Removes a chat and its messages

### Realtime Subscriptions

- `/lib/supabase-realtime.ts`: Contains helper functions for Supabase Realtime:
  - `subscribeToChatUpdates`: Subscribes to real-time updates for a specific chat
  - `subscribeToUserChats`: Subscribes to all chat updates for a user

### State Management

- `/stores/chatList.ts`: Updated to use Supabase for chat storage and updates
  - Added Realtime subscription management
  - Stores use localStorage as a backup/offline cache
  - Directly calls Supabase RPC functions

## Migration Steps

1. Created Supabase Edge Function for chat API
2. Added PostgreSQL functions for chat operations
3. Implemented Realtime subscriptions for chat updates
4. Updated store to use Supabase as the source of truth

## Security Improvements

- Row-Level Security (RLS) policies ensure users can only access their own data
- Server-side validation in PostgreSQL functions
- Proper user ID checks in all database operations

## Development Setup

### Prerequisites

- Supabase CLI installed
- Supabase project created with the following environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `OPENAI_API_KEY`

### Local Development

1. Start a local Supabase instance:
   ```
   supabase start
   ```

2. Deploy Edge Functions:
   ```
   supabase functions deploy chat
   ```

3. Run the migrations:
   ```
   supabase db push
   ```

4. Start the Next.js app:
   ```
   npm run dev
   ```

## Deployment

1. Push migrations to production:
   ```
   supabase db push --db-url=PRODUCTION_URL
   ```

2. Deploy edge functions:
   ```
   supabase functions deploy --project-ref=YOUR_PROJECT_REF
   ```

3. Deploy the frontend to your hosting provider of choice

## Benefits of This Architecture

- **Reduced vendor lock-in**: Less dependency on Next.js and Vercel
- **Improved scalability**: Database-level operations for better performance
- **Real-time capabilities**: Live updates without WebSockets implementation
- **Enhanced security**: Row-level security at the database layer
- **Simplified state management**: Database as the source of truth
