import { Context } from 'hono';
import { HonoType } from '../../types';
import { setCookie } from 'hono/cookie';

const handle = async (c: Context<HonoType, '/auth/callback'>) => {
	try {
		const url = new URL(c.req.url);
		const code = url.searchParams.get('code');

		if (!code) {
			throw new Error('No authorization code received from Akahu');
		}

		if (!code.startsWith('id_')) {
			throw new Error('Invalid authorization code format');
		}

		// Store the code for later use with transaction enrichment
		// For now, we'll just return it
		setCookie(c, 'User-Token', code, {
			httpOnly: true,
			maxAge: 2_592_000,
			// Dogey hack to make work on localhost
			domain: 'localhost',
		});

		// Doggy redirect to make it work on localhost
		return c.redirect(`http://localhost:5173/loading`, 302);
		return c.redirect(`${c.env.APP_URL}/loading`, 302);
	} catch (error) {
		console.error('Error in Akahu callback:', error);
		return c.json(
			{
				success: false,
				errors: [`Callback error: ${error instanceof Error ? error.message : 'Unknown error'}`],
			},
			500,
		);
	}
};

export default handle;
