import { corsHeaders } from '../utils/cors';
import { Env } from '../types';
import { analyzeTransactions } from '../analytics/transactions';

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
				date: values[0],
				amount: parseFloat(values[1]),
				description: values[2],
			};
		});
}

export async function handleCsvUpload(request: Request, env: Env, origin: string): Promise<Response> {
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

		// Send transactions to Akahu
		const akahuResponse = await fetch(`${env.AKAHU_API_URL}/transactions/bulk`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${env.AKAHU_APP_TOKEN}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ transactions }),
		});

		if (!akahuResponse.ok) {
			const errorData = await akahuResponse.json();
			throw new Error(`Akahu API error: ${JSON.stringify(errorData)}`);
		}

		const akahuData = await akahuResponse.json();

		// Analyze the transactions
		const analytics = analyzeTransactions(transactions);

		// Return both the transactions and analytics
		return new Response(JSON.stringify({ 
			transactions, 
			akahuResponse: akahuData,
			analytics 
		}), {
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
