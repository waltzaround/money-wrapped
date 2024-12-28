import { corsHeaders } from '../utils/cors';
import { Env } from '../types';
import { analyzeTransactions } from '../analytics/transactions';
import { enrichTransactions } from '../utils/akahu';

// Helper function to parse CSV
function parseCsvToTransactions(csvText: string, connection?: string) {
	if (!csvText) {
		console.error('No CSV text provided to parse');
		return [];
	}

	const lines = csvText.split('\n');
	if (lines.length === 0) {
		console.error('CSV file is empty');
		return [];
	}

	const headers = lines[0].split(',');
	if (headers.length < 3) {
		console.error('CSV file does not have enough columns. Expected at least 3 columns for date, amount, and description');
		return [];
	}

	// Find the index of each required column
	const dateIndex = headers.findIndex(h => h.toLowerCase().includes('date'));
	const amountIndex = headers.findIndex(h => h.toLowerCase().includes('amount'));
	const detailsIndex = headers.findIndex(h => h.toLowerCase().includes('details'));

	if (dateIndex === -1 || amountIndex === -1 || detailsIndex === -1) {
		console.error('CSV file missing required columns. Need TransactionDate, Amount, and Details. Found headers:', headers);
		return [];
	}

	const transactions = lines
		.slice(1)
		.filter((line) => line.trim())
		.map((line, index) => {
			const values = line.split(',');
			const rawAmount = values[amountIndex]?.trim() || '0';
			const amount = parseFloat(rawAmount.replace(/[^-\d.]/g, '')) || 0; // Convert empty or invalid amounts to 0
			const description = values[detailsIndex]?.trim() || 'Unknown';
			const date = values[dateIndex]?.trim() || '';
			
			// Skip if no date is provided
			if (!date) {
				return null;
			}
			
			// Parse the date to check year
			let day: number, month: number, year: number;
			
			// Try different date formats
			const dateFormats = [
				// DD/MM/YYYY (NZ format)
				() => {
					const [d, m, y] = date.split(/[/-]/).map(Number);
					if (d && m && y && d <= 31 && m <= 12) {
						day = d;
						month = m;
						year = y;
						return true;
					}
					return false;
				},
				// MM/DD/YYYY (US format)
				() => {
					const [m, d, y] = date.split(/[/-]/).map(Number);
					if (d && m && y && d <= 31 && m <= 12) {
						day = d;
						month = m;
						year = y;
						return true;
					}
					return false;
				},
				// YYYY/MM/DD (ISO format)
				() => {
					const [y, m, d] = date.split(/[/-]/).map(Number);
					if (d && m && y && d <= 31 && m <= 12) {
						day = d;
						month = m;
						year = y;
						return true;
					}
					return false;
				}
			];

			// Try each format until one works
			const validDate = dateFormats.some(format => format());
			if (!validDate) {
				console.error('Invalid date format:', date);
				return null;
			}

			if (!year || year !== 2024) {
				return null;
			}
			
			// Skip online payment thank you transactions
			if (description === 'Online       Payment -  Thank You') {
				return null;
			}

			const transaction: {
				id: string;
				description: string;
				amount: number;
				direction: 'debit';
				_connection?: string;
				date: string;
			} = {
				id: `tx_${date.replace(/\//g, '')}_${index}`,
				description,
				amount,
				direction: 'debit',
				date
			};

			if (connection) {
				transaction._connection = connection;
			}

			return transaction;
		})
		.filter((t): t is NonNullable<typeof t> => t !== null);

	return transactions;
}

export async function handleCsvUpload(request: Request, env: Env, origin: string): Promise<Response> {
	try {
		const formData = await request.formData();
		const files = formData.getAll('files');
		const connection = formData.get('connection') as string | null;

		console.log(`Processing ${files.length} CSV files${connection ? ` with connection ${connection}` : ''}`);

		if (!files.length || !files.every(file => file instanceof File)) {
			return new Response('No CSV files provided', {
				status: 400,
				headers: corsHeaders(origin),
			});
		}

		if (connection && (typeof connection !== 'string')) {
			return new Response('Invalid bank connection provided', {
				status: 400,
				headers: corsHeaders(origin),
			});
		}

		// Process all CSV files and combine transactions
		const allTransactions = [];
		for (const file of files) {
			try {
				console.log(`Processing file: ${(file as File).name}, size: ${(file as File).size} bytes`);
				const csvText = await (file as File).text();
				if (!csvText) {
					console.error(`Empty or invalid CSV file: ${(file as File).name}`);
					continue;
				}
				const fileTransactions = parseCsvToTransactions(csvText, connection || undefined);
				console.log(`Found ${fileTransactions.length} valid transactions in file: ${(file as File).name}`);
				if (fileTransactions.length === 0) {
					console.warn(`No valid transactions found in file: ${(file as File).name}`);
					return new Response(`No valid transactions found in file: ${(file as File).name}. Make sure the CSV has TransactionDate, Amount, and Details columns.`, {
						status: 400,
						headers: corsHeaders(origin),
					});
				}
				allTransactions.push(...fileTransactions);
			} catch (error) {
				console.error(`Error processing file ${(file as File).name}:`, error);
				return new Response(`Error processing file ${(file as File).name}: ${error}`, {
					status: 400,
					headers: corsHeaders(origin),
				});
			}
		}

		if (allTransactions.length === 0) {
			return new Response('No valid transactions found in uploaded files', {
				status: 400,
				headers: corsHeaders(origin),
			});
		}

		// Sort all transactions by date
		allTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

		// Temporarily skip Akahu enrichment
		const enrichedTransactions = allTransactions.map(transaction => ({
			...transaction,
			merchant: transaction.description,
			category: null,
			categoryGroup: null,
		}));

		// Analyze the transactions
		const analytics = analyzeTransactions(enrichedTransactions);
		
		console.log('Analytics results:', JSON.stringify({
			transactionCount: analytics.transactionCount,
			totalSpent: analytics.totalSpent,
			averageTransactionAmount: analytics.averageTransactionAmount,
			topMerchants: analytics.topMerchants,
			monthlySpending: analytics.monthlySpendingArray,
			weekendSpending: analytics.weekendSpending,
			largestTransactions: analytics.largestTransactions,
			earliestTransaction: analytics.earliestTransaction,
			latestTransaction: analytics.latestTransaction
		}, null, 2));

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
