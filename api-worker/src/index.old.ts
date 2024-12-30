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

import dotenv from 'dotenv';
import { handleCsvUpload } from './routes/upload-csv';
import { handleAkahuAuth } from './routes/akahu-auth';
import { handleAkahuCallback } from './routes/akahu-callback';

dotenv.config();

interface Env {
	AKAHU_APP_TOKEN: string;
}

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
		const pathname = url.pathname;

		// Handle CORS preflight requests
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: corsHeaders(origin),
			});
		}

		// Handle Akahu auth routes
		if (pathname === '/auth/init') {
			return handleAkahuAuth(request, env, origin);
		}

		if (pathname === '/auth/callback') {
			return handleAkahuCallback(request, env, origin);
		}

		// Route handling
		switch (pathname) {
			case '/upload-csv':
				if (request.method !== 'POST') {
					return new Response('Method not allowed', {
						status: 405,
						headers: corsHeaders(origin),
					});
				}
				return handleCsvUpload(request, env, origin);

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
