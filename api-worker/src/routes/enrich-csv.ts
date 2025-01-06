import { Context, Hono } from 'hono';
import { HonoType } from '../types';
import { streamSSE } from 'hono/streaming';
import { ce } from '../utils/progressUpdate';
import { enrichTransactions } from '../utils/akahu';
import { rateLimit } from '../utils/rateLimit';
import lzString from 'lz-string';

const handler = async (c: Context<HonoType, '/akahu/transactions'>) => {
	const maxProgress = 2;

	const compressedTransactions = c.req.query('transactions');

	if (!compressedTransactions) {
		return c.json({ success: false, message: 'No transactions provided' });
	}

	const decompressed = lzString.decompressFromEncodedURIComponent(compressedTransactions);

	const all_transactions = JSON.parse(decompressed);
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
			enriched = await enrichTransactions(
				all_transactions.map((x) => ({
					description: x.description,
					id: x.id,
					amount: x.amount,
					direction: x.direction,
					_connection: x.connection,
				})),
				c.env,
				abortController.signal,
			);
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
			raw_transactions: enriched,
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
