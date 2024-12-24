/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

function corsHeaders(origin: string) {
	return {
		'Access-Control-Allow-Origin': origin,
		'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type',
	};
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);
		const origin = request.headers.get('Origin') || 'http://localhost:5173';

		// Handle CORS preflight requests
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: corsHeaders(origin),
			});
		}

		// Route handling
		switch (url.pathname) {
			case '/upload-csv':
				if (request.method !== 'POST') {
					return new Response('Method not allowed', {
						status: 405,
						headers: corsHeaders(origin),
					});
				}
				return handleCsvUpload(request, origin);

			case '/akahu-auth':
				if (request.method !== 'GET') {
					return new Response('Method not allowed', {
						status: 405,
						headers: corsHeaders(origin),
					});
				}
				return handleAkahuAuth(request, env, origin);

			default:
				return new Response('Not found', {
					status: 404,
					headers: corsHeaders(origin),
				});
		}
	},
} satisfies ExportedHandler<Env>;

async function handleCsvUpload(request: Request, origin: string): Promise<Response> {
	try {
		const formData = await request.formData();
		const csvFile = formData.get('file');

		if (!csvFile || !(csvFile instanceof File)) {
			return new Response('No CSV file provided', {
				status: 400,
				headers: corsHeaders(origin),
			});
		}

		return new Response('CSV upload successful', {
			status: 200,
			headers: corsHeaders(origin),
		});
	} catch (error) {
		return new Response('Error processing CSV', {
			status: 500,
			headers: corsHeaders(origin),
		});
	}
}

async function handleAkahuAuth(request: Request, env: Env, origin: string): Promise<Response> {
	const akahuAuthUrl = 'https://api.akahu.io/v1/auth';

	return Response.redirect(akahuAuthUrl, 302);
}
