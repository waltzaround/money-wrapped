import { corsHeaders } from '../utils/cors';
import { Env } from '../types';

interface AkahuAuthResponse {
    url?: string;
}

export async function handleAkahuAuth(request: Request, env: Env, origin: string): Promise<Response> {
	// Create base64 encoded credentials
	const credentials = btoa(`${env.AKAHU_APP_TOKEN}:${env.AKAHU_APP_SECRET}`);
	console.timeLog("Credentials")
	console.log(credentials);
	// Set up headers with Basic authentication
	const headers = {
		'Authorization': `Basic ${credentials}`,
		'Content-Type': 'application/json'
	};

	// Make request to Akahu auth endpoint
	const response = await fetch('https://api.oneoff.akahu.io/v1/auth', {
		method: 'POST',
		headers,
		body: JSON.stringify({
			redirect_uri: `${origin}/auth-callback`,
			response_type: 'code',
			scope: 'ENDURING_CONSENT',
			email: true
		})
	});

	const data = await response.json() as AkahuAuthResponse;

	
	// Redirect to Akahu's authorization page
	if (data.url) {
		return Response.redirect(data.url, 302);
	}

	// Handle error case
	return new Response(JSON.stringify({ error: 'Failed to get authorization URL' }), {
		status: 500,
		headers: {
			'Content-Type': 'application/json',
			...corsHeaders
		}
	});
}
