import { Context, Hono } from "hono";
import { HonoType } from "../types";
import { stream, streamText, streamSSE, SSEMessage } from 'hono/streaming';
import { ce } from "../utils/progressUpdate";
import { getCookie } from "hono/cookie";
import { env, getRuntimeKey } from 'hono/adapter'
import { listTransactions, year } from "../utils/akahu";



export default async function akahuEnrich(c: Context<HonoType, '/akahu/transactions'>) {
	const maxProgress = 4;

	let user_token = getCookie(c,'User-Token');
	if (!user_token) {
		return c.json({ success: false, errors: ['No user token found'] }, 400);
	}

	return streamSSE(c, async (stream) => {
		let currentStep = 1;

		await stream.writeSSE(ce({
			event: "max-progress",
			progress: maxProgress
		}));

		await stream.writeSSE(ce({
			event: "progress",
			message: `Hunting down all of your ${year} transactions`,
			progress: currentStep++
		}));

		let all_transactions = [];
		try {
			all_transactions = await listTransactions(c, user_token);
		} catch {
			await stream.writeSSE(ce({
				event: "error",
				message: "Failed to fetch transactions",
				progress: currentStep++
			}));

			return;
		}

		await stream.writeSSE(ce({
			event: "progress",
			message: `Waiting in queue to categorize ${all_transactions.length} transactions`,
			progress: currentStep++
		}));

		await stream.sleep(5000)


		let dataPack = JSON.stringify({
			raw_transactions: all_transactions,
			date: new Date().toISOString()
		})


		await stream.writeSSE(ce({
			event: "result",
			data: dataPack,
			progress: currentStep++
		}));
	});
};
