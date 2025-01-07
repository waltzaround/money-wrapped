import { Context } from 'hono';
import { z } from 'zod';
import { HonoType } from '../types';
import { parse } from 'csv-parse';
import { DateTime } from 'luxon';

export const bodyValidator = z.object({
	files: z.array(z.instanceof(File)).or(z.instanceof(File).transform((file) => [file])),
	connection: z.string().optional(),
});

const handle = async (
	c: Context<
		HonoType,
		'/upload-csv',
		{
			in: {
				form: z.infer<typeof bodyValidator>;
			};
			out: {
				form: z.infer<typeof bodyValidator>;
			};
		}
	>,
) => {
	const data = c.req.valid('form');
	console.log('Form data:', data);

	const csvs = await Promise.all(data.files.map((x) => x.text()));
	const transactions: { id: string; description: string; direction: 'debit' | 'credit'; date: string; amount: number; _connection: string }[] = [];

	let count = 0;

	for (const csv of csvs) {
		let dateColumn: string;
		let amountColumn: string;
		let detailsColumn: string;
		let payeeColumn: string;
		let memoColumn: string;

		console.log('Raw CSV content:');
		console.log(csv);

		// Detect CSV format
		const lines = csv.split('\n');
		console.log('CSV lines:', lines);

		// Find the actual header line
		const headerIndex = lines.findIndex(line => 
			(line.includes('Date,') && line.includes('Tran Type') && line.includes('Amount')) || // ASB format
			(line.includes('TransactionDate') && line.includes('Details')) // ANZ format
		);

		if (headerIndex === -1) {
			console.log('Could not find header line');
			continue;
		}

		const headerLine = lines[headerIndex];
		console.log('Using header line:', headerLine);

		// Determine bank format
		const isANZ = headerLine.includes('TransactionDate');
		const isASB = headerLine.includes('Tran Type');

		console.log('Bank format:', isANZ ? 'ANZ' : isASB ? 'ASB' : 'Unknown');
		
		// Set connection ID based on bank format
		const connectionId = isANZ 
			? "conn_cjgaawozb000001nyd111xixr"  // ANZ
			: isASB 
			? "conn_cjgaaqcna000001ldwof8tvj0"  // ASB
			: "";

		// Skip processing if bank format is unknown
		if (!connectionId) {
			console.log('Unknown bank format, skipping file');
			continue;
		}

		console.log('Connection ID:', connectionId);

		// Skip metadata headers
		let csvContent = lines.slice(headerIndex).join('\n');

		const parseResult = await parse(csvContent, { 
			cast: true, 
			columns: true,
			skip_empty_lines: true,
			trim: true,
			relax_quotes: true,
			relax_column_count: true
		});

		console.log('Parsed records:', parseResult);

		const records: any[] = [];
		for await (const record of parseResult) {
			records.push(record);
		}

		const parsedTransactions = records
			.map((item) => {
				console.log('Processing transaction:', item);

				if (dateColumn === undefined) {
					dateColumn = isANZ ? 'TransactionDate' : 'Date';
					console.log('Found date column:', dateColumn);
				}

				if (amountColumn === undefined) {
					amountColumn = 'Amount';
					console.log('Found amount column:', amountColumn);
				}

				if (detailsColumn === undefined) {
					detailsColumn = isANZ ? 'Details' : 'Process Date';
					console.log('Found details column:', detailsColumn);
				}

				let amount = Number(item[amountColumn]);
				let date = item[dateColumn];
				
				console.log('Raw amount:', item[amountColumn]);
				console.log('Parsed amount:', amount);
				console.log('Raw date:', date);

				// Skip invalid amounts
				if (isNaN(amount)) {
					console.log('Invalid amount:', item[amountColumn]);
					return undefined;
				}

				// For ASB:
				// - Amount is already negative for debits
				// - Filter out credits (positive amounts)
				// - Keep only negative amounts (spending)
				if (isASB) {
					if (amount > 0) {
						console.log('Filtering out ASB credit:', amount);
						return undefined;
					}
				} else {
					// For ANZ:
					// - Amount is positive
					// - Use Type column to determine debit/credit
					// - Make debits negative
					const type = item['Type']?.toString().trim();
					if (type === 'C') {
						console.log('Filtering out ANZ credit transaction');
						return undefined;
					}
					// Make it negative since it's a debit
					amount = -Math.abs(amount);
				}
				
				// Handle description based on bank format
				let description = '';
				if (isASB) {
					const payee = item['Payee']?.toString().trim() || '';
					const memo = item['Memo']?.toString().trim() || '';
					description = [payee, memo].filter(Boolean).join(' - ');

					// Filter out specific transaction types
					const tranType = item['Tran Type']?.toString().trim();
					if (tranType === 'D/C' || tranType === 'TFR OUT') {
						console.log('Filtering out ASB transaction type:', tranType);
						return undefined;
					}
				} else {
					// For ANZ, use the Details column
					description = item['Details']?.toString().trim() || '';
				}

				console.log('Description:', description);

				// Parse date based on format
				let parsedDate;
				if (isASB) {
					parsedDate = DateTime.fromFormat(date, 'yyyy/MM/dd');
				} else {
					// ANZ format (DD/MM/YYYY)
					parsedDate = DateTime.fromFormat(date, 'dd/MM/yyyy');
				}

				if (!parsedDate.isValid) {
					console.log(date + " isn't a valid date");
					return undefined;
				}

				// Skip non-2024 transactions
				if (parsedDate.year !== 2024) {
					console.log('Skipping non-2024 transaction:', date);
					return undefined;
				}

				console.log('Parsed date:', parsedDate.toISO());

				count++;
				const transaction = {
					id: `tx_${parsedDate.toISO()}_${count}`,
					description: description,
					direction: amount < 0 ? 'debit' : 'credit',
					date: parsedDate.toISO(),
					amount: amount,
					_connection: connectionId,
				};
				console.log('Created transaction:', transaction);
				return transaction;
			})
			.filter((x) => x !== undefined);

		transactions.push(...parsedTransactions);
	}

	return c.json({ success: true, transactions });
};

export default handle;
