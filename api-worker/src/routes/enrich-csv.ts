import { Context, Hono } from 'hono';
import { HonoType } from '../types';
import { streamSSE } from 'hono/streaming';
import { ce } from '../utils/progressUpdate';
import { BANK_CONNECTIONS, enrichTransactions } from '../utils/akahu';
import { rateLimit } from '../utils/rateLimit';
import lzString from 'lz-string';
import { RawTransaction } from '../analytics/csvParse';

const handler = async (c: Context<HonoType, '/akahu/transactions'>) => {
	const maxProgress = 2;

	const compressedTransactions = c.req.query('transactions');

	if (!compressedTransactions) {
		return c.json({ success: false, message: 'No transactions provided' });
	}

	const decompressed = lzString.decompressFromEncodedURIComponent(compressedTransactions);

	const data = JSON.parse(decompressed);
	const all_transactions: RawTransaction[] = data.raw_transactions;
	// console.log('Transactions to enrich:', all_transactions);
	let currentStep = 0;

	return streamSSE(c, async (stream) => {
		const abortController = new AbortController();
		const signal = abortController.signal;

		stream.onAbort(abortController.abort);

		if (signal.aborted) {
			return;
		}

		stream.writeSSE(
			ce({
				event: 'max-progress',
				progress: maxProgress,
			}),
		);

		await stream.writeSSE(
			ce({
				event: 'progress',
				message: `Waiting in queue to categorize ${all_transactions.length} transactions`,
				progress: currentStep++,
			}),
		);

		await rateLimit({
			signal,
			env: c.env,
			inner: async () => {
				await stream.writeSSE(
					ce({
						event: 'progress',
						message: `Categorizing your transactions`,
						progress: currentStep++,
					}),
				);
			},
			limitName: 'genie',
			concurrent: 10,
		});

		let enriched;
		try {
			// Save transaction dates before enrichment
			const transactionDates = new Map(all_transactions.map((x) => [x.id, x.date]));

			enriched = await enrichTransactions(
				all_transactions.map((x) => ({
					description: x.description,
					id: x.id,
					amount: x.amount,
					direction: x.amount < 0 ? 'DEBIT' : 'CREDIT',
					_connection: x._connection,
				})),
				c.env,
				abortController.signal,
			);

			// Reattach dates to enriched transactions
			enriched = enriched.map((tx) => ({
				...tx,
				date: (tx.id && transactionDates.get(tx.id)) || '',
			}));
		} catch (ex) {
			console.error(ex);
			await stream.writeSSE(
				ce({
					event: 'error',
					message: 'Failed to enrich transactions',
					progress: currentStep++,
				}),
			);

			return;
		}

		let dataPack = JSON.stringify({
			raw_transactions: enriched.map((tx) => ({
				...tx,
				connection: {
					id: tx._connection,
					name: BANK_CONNECTIONS[tx._connection as keyof typeof BANK_CONNECTIONS ?? BANK_CONNECTIONS.UNKNOWN],
				},
			})),
			date: new Date().toISOString(),
		});

		await stream.writeSSE(
			ce({
				event: 'result',
				data: dataPack,
				progress: currentStep++,
			}),
		);
	});
};

export default handler;
