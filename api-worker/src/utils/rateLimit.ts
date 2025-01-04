import { randomUUID } from 'crypto';

type Rate = { active: { start: number; requestId: string }[]; pending: string[] };

type Options<T extends () => Promise<U>, U> = {
	limitName: string;
	env: Env;
	inner: T;
	concurrent: number;
	signal: AbortSignal;
};

export const rateLimit = async <T extends () => Promise<U>, U>({
	limitName,
	env,
	inner,
	concurrent,
	signal,
}: Options<T, U>): Promise<U> => {
	const requestId = randomUUID();

	try {
		return await new Promise((res, rej) => {
			let done = false;
			const interval = setInterval(async () => {
				const rate = await env.RATELIMIT.get(limitName);

				if (rate == null) {
					await env.RATELIMIT.put(limitName, JSON.stringify({ active: [{ requestId, start: Date.now() }], pending: [] } satisfies Rate));

					clearInterval(interval);
					await inner().then(res).catch(rej);
					done = true;
					return;
				}

				const data = JSON.parse(rate) as Rate;

				if (!data.pending.includes(requestId)) {
					data.pending.push(requestId);
				}

				data.active = data.active.filter(({ start }) => Date.now() - start < 30_000);

				const index = Math.max(concurrent - data.active.length, 0);
				const pendingIndex = data.pending.slice(0, index).indexOf(requestId);

				if (pendingIndex < 0) {
					await env.RATELIMIT.put(limitName, JSON.stringify(data));
					return;
				}

				clearInterval(interval);

				data.pending.splice(pendingIndex, 1);
				data.active.push({ start: Date.now(), requestId });

				await env.RATELIMIT.put(limitName, JSON.stringify(data));

				await inner().then(res).catch(rej);
				done = true;

				return;
			}, 1000);

			signal.onabort = () => {
				clearInterval(interval);

				if (!done) {
					rej(new Error('Aborted'));
				}
			};
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
