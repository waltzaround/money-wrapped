import { Context, Hono } from 'hono';
import { HonoType } from '../types';
import { streamSSE } from 'hono/streaming';
import { ce } from '../utils/progressUpdate';
import { getCookie } from 'hono/cookie';
import { enrichTransactions, listTransactions, Transaction, year } from '../utils/akahu';
import { rateLimit } from '../utils/rateLimit';

export default async function akahuEnrich(c: Context<HonoType, '/akahu/transactions'>) {
	const maxProgress = 4;

	let user_token = getCookie(c, 'User-Token');
	if (!user_token) {
		return c.json({ success: false, errors: ['No user token found'] }, 400);
	}

	return streamSSE(c, async (stream) => {
		let currentStep = 1;

		let abortController = new AbortController();
		stream.onAbort(() => abortController.abort());
		let signal = abortController.signal;

		await stream.writeSSE(
			ce({
				event: 'max-progress',
				progress: maxProgress,
			}),
		);

		await stream.writeSSE(
			ce({
				event: 'progress',
				message: `Hunting down all of your ${year} transactions`,
				progress: currentStep++,
			}),
		);

		if (signal.aborted) {
			return;
		}

		let all_transactions: Transaction[] = [];
		try {
			all_transactions = await listTransactions(c, user_token);
		} catch {
			await stream.writeSSE(
				ce({
					event: 'error',
					message: 'Failed to fetch transactions',
					progress: currentStep++,
				}),
			);

			return;
		}

		if (signal.aborted) {
			return;
		}

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
			concurrent: 2,
		});

		let enriched;
		try {
			// Save transaction dates before enrichment
			const transactionDates = new Map(all_transactions.map(x => [x._id, x.date]));
			
			enriched = await enrichTransactions(
				all_transactions.map((x) => ({
					description: x.description,
					id: x._id,
					amount: x.amount,
					direction: x.amount < 0 ? 'DEBIT' : 'CREDIT',
					_connection: x._connection,
				})),
				c.env,
				abortController.signal,
			);

			// Reattach dates to enriched transactions
			enriched = enriched.map(tx => ({
				...tx,
				date: transactionDates.get(tx.id) || '',
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
}
