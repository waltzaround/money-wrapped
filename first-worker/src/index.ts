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

async function handleCsvUpload(request: Request, env: Env, origin: string): Promise<Response> {
	try {
		const formData = await request.formData();
		const csvFile = formData.get('file');

		if (!csvFile || !(csvFile instanceof File)) {
			return new Response('No CSV file provided', {
				status: 400,
				headers: corsHeaders(origin),
			});
		}

		// Read and parse CSV file
		const csvText = await csvFile.text();
		const transactions = parseCsvToTransactions(csvText);

		// Submit to Akahu enrichment API
		const token = process.env.AKAHU_APP_TOKEN || env.AKAHU_APP_TOKEN;
		const enrichmentResponse = await fetch('https://api.oneoff.akahu.io/v1/transactions/code', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-Akahu-ID': token,
			},
			body: JSON.stringify({
				transactions: transactions.map((tx) => ({
					date: tx.date,
					amount: tx.amount,
					description: tx.description,
				})),
			}),
		});
		console.log('Prepare to enrich!');
		console.log(enrichmentResponse);

		if (!enrichmentResponse.ok) {
			throw new Error(`Akahu API error: ${enrichmentResponse.statusText}`);
		}

		const enrichedData = await enrichmentResponse.json();

		return new Response(JSON.stringify(enrichedData), {
			status: 200,
			headers: {
				...corsHeaders(origin),
				'Content-Type': 'application/json',
			},
		});
	} catch (error: unknown) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
		return new Response(`Error processing CSV: ${errorMessage}`, {
			status: 500,
			headers: corsHeaders(origin),
		});
	}
}

// Helper function to parse CSV
function parseCsvToTransactions(csvText: string) {
	const lines = csvText.split('\n');
	const headers = lines[0].split(',');

	return lines
		.slice(1)
		.filter((line) => line.trim())
		.map((line) => {
			const values = line.split(',');
			return {
				date: values[0], // Adjust index based on your CSV structure
				amount: parseFloat(values[1]), // Adjust index based on your CSV structure
				description: values[2], // Adjust index based on your CSV structure
			};
		});
}

async function handleAkahuAuth(request: Request, env: Env, origin: string): Promise<Response> {
	const akahuAuthUrl = 'https://api.oneoff.akahu.io/v1/auth';

	return Response.redirect(akahuAuthUrl, 302);
}
