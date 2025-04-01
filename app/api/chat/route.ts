import openai from '@/lib/openai';
import { NextRequest } from 'next/server';
import { addMessageToChat } from '@/lib/supabase-helpers';
import { ChatCompletionMessageParam } from 'openai/resources';

export const runtime = 'edge';

// Define types for the messages
interface ChatMessage {
  isUser: boolean;
  text: string | object;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, chatId, userId } = await req.json();

    // Input validation
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Invalid messages format' }), {
        status: 400,
      });
    }

    // Save the user message to Supabase (if enabled)
    if (chatId && userId && process.env.ENABLE_SUPABASE_STORAGE === 'true') {
      try {
        const userMessage = messages[messages.length - 1];
        const content = typeof userMessage.text === 'string' 
          ? userMessage.text 
          : JSON.stringify(userMessage.text);
          
        await addMessageToChat(chatId, userId, content, true);
      } catch (error) {
        console.error('Error saving user message to Supabase:', error);
      }
    }

    // Convert messages to the format OpenAI expects
    const openaiMessages: ChatCompletionMessageParam[] = messages.map((message: ChatMessage) => ({
      role: message.isUser ? 'user' : 'assistant',
      content: typeof message.text === 'string' ? message.text : JSON.stringify(message.text),
    })) as ChatCompletionMessageParam[];

    // Create streaming response with OpenAI
    const stream = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: openaiMessages,
      stream: true,
    });

    // Create a encoder to handle the stream chunks
    const encoder = new TextEncoder();
    let fullResponse = '';

    // Return a readable stream response
    return new Response(
      new ReadableStream({
        async start(controller) {
          // Process each chunk from the OpenAI stream
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              fullResponse += content;
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();

          // Save the completed response to Supabase
          if (chatId && userId && process.env.ENABLE_SUPABASE_STORAGE === 'true') {
            try {
              await addMessageToChat(chatId, userId, fullResponse, false);
            } catch (error) {
              console.error('Error saving AI response to Supabase:', error);
            }
          }
        }
      })
    );
  } catch (error: Error | unknown) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Error processing your request' }),
      { status: 500 }
    );
  }
} 