import akahu, { GenieSearchBodyParam, GenieSearchResponse200 } from '@api/akahu';
import { randomUUID } from 'node:crypto';

type ArrayExtract<T> = T extends (infer U)[] ? U : T;
type PromiseExtract<T> = T extends Promise<infer U> ? U : T;

type Transaction = {
	id: string;
	desicruytion: string;
	_connection: string;
	amount: string;
	direction: 'DEBIT' | 'CREDIT';
};

type AkahuEnrichedTransaction = {
	type: string;
	merchant?: {
		name: string;
		id: string;
	};
	category?: {
		name: string;
		group: string;
	};
} & ArrayExtract<GenieSearchBodyParam>;

type Rate = { active: { start: number; requestId: string }[]; pending: string[] };

const rateLimit = async <T extends () => Promise<U>, U>(limitName: string, env: Env, inner: T): Promise<U> => {
	const requestId = randomUUID();

	try {
		return new Promise((res, rej) => {
			const interval = setInterval(async () => {
				const rate = await env.RATELIMIT.get(limitName);

				if (rate == null) {
					await env.RATELIMIT.put(limitName, JSON.stringify({ active: [{ requestId, start: Date.now() }], pending: [] } satisfies Rate));

					await inner().then(res).catch(rej);
					return;
				}

				const data = JSON.parse(rate) as Rate;

				data.active = data.active.filter(({ start }) => Date.now() - start < 30_000);
				const pendingIndex = data.pending.slice(0, Math.min(data.active.length - 10, 0)).indexOf(requestId);

				if (pendingIndex < 0) {
					await env.RATELIMIT.put(limitName, JSON.stringify(data));
					return;
				}

				clearInterval(interval);

				data.pending.splice(pendingIndex, 1);
				data.active.push({ start: Date.now(), requestId });

				await env.RATELIMIT.put(limitName, JSON.stringify(data));

				await inner().then(res).catch(rej);

				return;
			}, 1000);
		});
	} finally {
		const storedData = await env.RATELIMIT.get(limitName);

		if (storedData != null) {
			const data = JSON.parse(storedData) as Rate;

			data.active = data.active.filter(({ requestId: x }) => x != requestId);

			await env.RATELIMIT.put(limitName, JSON.stringify(data));
		}
	}
};

export function enrichTransactions(transactions: GenieSearchBodyParam, env: Env): Promise<AkahuEnrichedTransaction[]> {
	const fn = async () => {
		// Make sure every transaction has an ID
		transactions.forEach((transaction) => {
			if (!transaction.id) {
				transaction.id == randomUUID();
			}
		});

		try {
			if (!env.AKAHU_GENIE_TOKEN) {
				console.warn('No Akahu Genie token provided, skipping enrichment');
				return transactions.map((transaction) => ({
					...transaction,
					type: 'TRANSACTION',
				}));
			}

			akahu.auth(env.AKAHU_GENIE_TOKEN);

			// Process in batches of 1000
			const BATCH_SIZE = 1000;
			const enrichments = new Map<string, ArrayExtract<GenieSearchResponse200['items']>>();

			for (let i = 0; i < transactions.length; i += BATCH_SIZE) {
				const batch = transactions.slice(i, i + BATCH_SIZE);
				console.log(`Processing batch ${i / BATCH_SIZE + 1} of ${Math.ceil(transactions.length / BATCH_SIZE)}`);

				const result = await akahu.genieSearch(batch);

				if (result.status !== 200) {
					continue;
				}

				for (const item of result.data.items) {
					enrichments.set(item.id!, item);
				}
			}

			return transactions.map((transaction) => {
				const result = enrichments.get(transaction.id!);

				if (result === undefined || result.results.length == 0) {
					return {
						...transaction,
						type: 'TRANSACTION',
					};
				}

				const [{ merchant, category }] = result.results;

				return { ...transaction, type: 'TRANSACTION', merchant: merchant, category: category };
			});
		} catch (error) {
			console.error('Error in enrichTransactions:', error);
			return transactions.map((x) => ({
				...x,
				type: 'TRANSACTION',
			}));
		}
	};

	return rateLimit('genie', env, fn);
}
