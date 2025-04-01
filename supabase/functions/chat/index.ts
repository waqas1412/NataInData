import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0'
import { OpenAI } from 'https://esm.sh/openai@4.20.0'

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Initialize OpenAI
const openaiApiKey = Deno.env.get('OPENAI_API_KEY') ?? ''
const openai = new OpenAI({
  apiKey: openaiApiKey
})

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatRequest {
  messages: Array<{
    text: string | Record<string, unknown>
    isUser: boolean
    timestamp: string
  }>
  chatId: string
  userId: string
}

serve(async (req) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers })
  }

  try {
    const { messages, chatId, userId } = await req.json() as ChatRequest

    // Input validation
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid messages format' }), 
        { status: 400, headers }
      )
    }

    // No need to save the user message here since it's already saved by the client
    // Now just do OpenAI request

    // Convert messages to OpenAI format
    const openaiMessages: Message[] = messages.map((message) => ({
      role: message.isUser ? 'user' : 'assistant',
      content: typeof message.text === 'string' ? message.text : JSON.stringify(message.text),
    }))

    // Create streaming response with OpenAI
    const stream = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: openaiMessages,
      stream: true,
    })

    // Create a readable stream response
    let responseText = ''
    const encoder = new TextEncoder()
    
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || ''
          if (content) {
            responseText += content
            controller.enqueue(encoder.encode(content))
          }
        }
        
        // Save the complete assistant response to Supabase
        try {
          const { error: messageError } = await supabase
            .from('messages')
            .insert({
              chat_id: chatId,  // chat_id is UUID
              content: responseText,
              is_user: false
            })
          
          if (messageError) {
            console.error('Error saving assistant message:', messageError)
          }
          
          // Update the chat's updated_at timestamp
          const { error: chatError } = await supabase
            .from('chats')
            .update({ updated_at: new Date() })
            .eq('id', chatId)
          
          if (chatError) {
            console.error('Error updating chat timestamp:', chatError)
          }
        } catch (error) {
          console.error('Error saving assistant response:', error)
        }
        
        controller.close()
      }
    })

    return new Response(readableStream, { 
      headers: {
        ...headers,
        'Content-Type': 'text/event-stream'
      }
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), 
      { status: 500, headers }
    )
  }
}) 