import { corsHeaders } from '../utils/cors';
import { Env } from '../types';

export async function handleAkahuCallback(request: Request, env: Env, origin: string): Promise<Response> {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');

    if (!code) {
      throw new Error('No authorization code received from Akahu');
    }

    if (!code.startsWith('id_')) {
      throw new Error('Invalid authorization code format');
    }

    // Store the code for later use with transaction enrichment
    // For now, we'll just return it
    return new Response(JSON.stringify({ code }), {
      headers: {
        ...corsHeaders(origin),
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in Akahu callback:', error);
    return new Response(`Callback error: ${error instanceof Error ? error.message : 'Unknown error'}`, {
      status: 500,
      headers: corsHeaders(origin)
    });
  }
}
