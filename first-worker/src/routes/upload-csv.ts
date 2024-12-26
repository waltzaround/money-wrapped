import { corsHeaders } from '../utils/cors';
import { Env } from '../types';
import { analyzeTransactions } from '../analytics/transactions';
import { enrichTransactions } from '../utils/akahu';

// Helper function to parse CSV
function parseCsvToTransactions(csvText: string) {
	const lines = csvText.split('\n');
	const headers = lines[0].split(',');

	const transactions = lines
		.slice(1)
		.filter((line) => line.trim())
		.map((line) => {
			const values = line.split(',');
			const amount = parseFloat(values[1].replace(/[^-\d.]/g, '')); // Remove any currency symbols and keep negative signs
			const description = values[2].trim();
			const date = values[0].trim();
			
			// Parse the date to check year
			const [day, month, year] = date.split('/').map(Number);
			if (year !== 2024) {
				return null;
			}
			
			// Skip online payment thank you transactions
			if (description === 'Online       Payment -  Thank You') {
				return null;
			}

			if (isNaN(amount)) {
				console.error('Invalid amount:', values[1], 'in line:', line);
				return null;
			}

			return {
				date,
				amount,
				description,
			};
		})
		.filter((t): t is NonNullable<typeof t> => t !== null); // Remove any null transactions

	// console.log('Parsed transactions:', transactions.slice(0, 3)); // Log first 3 transactions
	// console.log(`Filtered to ${transactions.length} transactions from 2024`);
	return transactions;
}

export async function handleCsvUpload(request: Request, env: Env, origin: string): Promise<Response> {
	try {
		const formData = await request.formData();
		const files = formData.getAll('files');

		console.log(`Processing ${files.length} CSV files`);

		if (!files.length || !files.every(file => file instanceof File)) {
			return new Response('No CSV files provided', {
				status: 400,
				headers: corsHeaders(origin),
			});
		}

		// Process all CSV files and combine transactions
		const allTransactions = [];
		for (const file of files) {
			console.log(`Processing file: ${(file as File).name}, size: ${(file as File).size} bytes`);
			const csvText = await (file as File).text();
			const fileTransactions = parseCsvToTransactions(csvText);
			// console.log(`Parsed ${fileTransactions.length} transactions from ${(file as File).name}`);
			allTransactions.push(...fileTransactions);
		}

		// console.log(`Total combined transactions: ${allTransactions.length}`);

		// Sort all transactions by date
		allTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

		// Enrich transactions with Akahu API
		// console.log('Enriching transactions with Akahu API...');
		const enrichedData = await enrichTransactions(allTransactions, env);
		
		// Merge enriched data with original transactions
		const enrichedTransactions = allTransactions.map((transaction, index) => ({
			...transaction,
			merchant: enrichedData[index].merchant?.name || null,
			category: enrichedData[index].category?.name || null,
			categoryGroup: enrichedData[index].category?.group || null,
		}));

		// Analyze the enriched transactions
		const analytics = analyzeTransactions(enrichedTransactions);

		// console.log('Analytics summary:', {
		// 	totalTransactions: analytics.transactionCount,
		// 	totalSpent: analytics.totalSpent,
		// 	dateRange: {
		// 		earliest: analytics.earliestTransaction.date,
		// 		latest: analytics.latestTransaction.date
		// 	}
		// });

		// Return just the analytics
		return new Response(JSON.stringify(analytics), {
			status: 200,
			headers: {
				...corsHeaders(origin),
				'Content-Type': 'application/json',
			},
		});
	} catch (error: unknown) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
		console.error('Error processing CSV:', error);
		return new Response(`Error processing CSV: ${errorMessage}`, {
			status: 500,
			headers: corsHeaders(origin),
		});
	}
}
