import { Context } from 'hono';
import { type HonoType } from '../../types';

type AkahuAuthResponse = {
	url?: string;
};

const handle = async (c: Context<HonoType, '/auth/init'>) => {
	const credentials = btoa(`${c.env.AKAHU_APP_TOKEN}:${c.env.AKAHU_APP_SECRET}`);

	// Set up headers with Basic authentication
	const headers = {
		Authorization: `Basic ${credentials}`,
		'Content-Type': 'application/json',
	};

	// Make request to Akahu auth endpoint
	const response = await fetch('https://api.oneoff.akahu.io/v1/auth', {
		method: 'POST',
		headers,
		body: JSON.stringify({
			redirect_uri: `${origin}/auth-callback`,
			response_type: 'code',
			scope: 'ENDURING_CONSENT',
			email: true,
		}),
	});

	const data = (await response.json()) as AkahuAuthResponse;

	// Redirect to Akahu's authorization page
	if (data.url) {
		return c.redirect(data.url, 302);
	}

	// Handle error case
	c.json(
		{
			error: 'Failed to get authorization url',
		},
		500,
	);
};

export default handle;
