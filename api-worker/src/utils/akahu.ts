import akahu, { GenieSearchBodyParam, GenieSearchResponse200 } from '@api/akahu';
import { randomUUID } from 'node:crypto';
import { HonoType } from '../types';
import { Context } from 'hono';
type ArrayExtract<T> = T extends (infer U)[] ? U : T;

export const year = '2024';

export enum BANK_CONNECTIONS {
	ANZ = "conn_cjgaawozb000001nyd111xixr",
	ASB = "conn_cjgaaqcna000001ldwof8tvj0",
	BNZ = "conn_cjgaatd57000001pe1t1z0iy9",
	Heartland = "conn_ck5rhsdbv0000ftx1bmdu9zas",
	Kiwibank = "conn_cjgaac5at000001qi2yw8ftil",
	Rabobank = "conn_ckydkmy3r000009mde2sx2i4d",
	"The Cooperative Bank" = "conn_cjgab1c8e000001pmyxrkhova",
	TSB = "conn_cjgab6fis000001qsytf1semy",
	Westpac = "conn_cjgaaozdo000001mrnqmkl1m0",
	UNKNOWN = "",
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

export async function enrichTransactions(
	transactions: GenieSearchBodyParam,
	env: Env,
	signal: AbortSignal,
): Promise<AkahuEnrichedTransaction[]> {
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

		const sdk = akahu.auth(env.AKAHU_GENIE_TOKEN);

		// Process in batches of 1000
		const BATCH_SIZE = 1000;
		const enrichments = new Map<string, ArrayExtract<GenieSearchResponse200['items']>>();

		for (let i = 0; i < transactions.length; i += BATCH_SIZE) {
			const batch = transactions.slice(i, i + BATCH_SIZE);
			console.log(`Processing batch ${i / BATCH_SIZE + 1} of ${Math.ceil(transactions.length / BATCH_SIZE)}`);

			const result = await sdk.genieSearch(batch);

			if (result.status !== 200) {
				console.log('It not have a fun time');
				continue;
			}

			for (const item of result.data.items) {
				enrichments.set(item.id!, item);
			}
		}

		return transactions.map((transaction) => {
			const result = enrichments.get(transaction.id!);

			// console.log(result?.results);

			if (result === undefined || result.results.length == 0) {
				return {
					...transaction,
					type: 'TRANSACTION',
				};
			}

			const [{ merchant, category }] = result.results;

			return {
				...transaction,
				type: 'TRANSACTION',
				merchant: merchant ? { id: merchant?._id, name: merchant?.name, logo: merchant?.logo, location: merchant?.location } : undefined,
				category: category ? { name: category.name, group: category.groups } : undefined,
			} as AkahuEnrichedTransaction;
		});
	} catch (error) {
		console.error('Error in enrichTransactions:', error);
		return transactions.map((x) => ({
			...x,
			type: 'TRANSACTION',
		}));
	}
}

export interface Transaction {
	_id: string;
	_account: string;
	_connection: ArrayExtract<GenieSearchBodyParam>['_connection'];
	date: string;
	description: string;
	type:
		| 'CARD'
		| 'PAYMENT'
		| 'TRANSFER'
		| 'INTEREST'
		| 'FEE'
		| 'TAX'
		| 'DIRECT CREDIT'
		| 'DIRECT DEBIT'
		| 'STANDING ORDER'
		| 'ATM'
		| 'FX'
		| 'LOAN'
		| 'KIWISAVER'
		| 'CREDIT'
		| 'DEBIT'
		| 'UNKNOWN';
	amount: number;
	balance?: number;
}

export async function listTransactions(c: Context<HonoType>, userToken: string): Promise<Transaction[]> {
	let cursor;

	// Join the App ID Token and App Secret with a ":" then base64 encode the result
	const credentials = btoa(`${c.env.AKAHU_APP_TOKEN}:${c.env.AKAHU_APP_SECRET}`);
	// Set the Authorization header for your requests using the base64 encoded credentials
	const authorisationHeader = `Basic ${credentials}`;

	let transactions: Transaction[] = [];

	do {
		const page = await fetch(`https://api.oneoff.akahu.io/v1/transactions/${userToken}${cursor ? `?cursor=${cursor}` : ''}`, {
			headers: {
				Authorization: authorisationHeader,
				'Content-Type': 'application/json',
				Cursor: cursor,
			},
		});

		if (!page.ok) {
			console.log('Failed to load transactions', page.status, page.statusText);
			throw new Error(`Failed to fetch transactions: ${page.status} ${page.statusText}`);
		}

		const data: any = await page.json();
		cursor = data.cursor?.next;
		transactions.push(...data.items);
	} while (cursor);

	return transactions;
}


interface AkahuProcessing {
	status: 'PROCESSING' | 'COMPLETE' | 'ERROR';
	status_reason: 'TIMEOUT' | 'PROCESSING_ERROR';
	available_results: {
		accounts?: boolean;
		parties?: boolean;
		transactions?: boolean;
		pdfs?: boolean;
	};
	connection: {
		_id: string;
		name: string;
		logo: string;
	}
	available_accounts_count: number;
	expires_at: string;
	created_at: string;
	updated_at: string;

}

export async function pollResultStatus(c: Context<HonoType>, userToken: string): Promise<AkahuProcessing> {
	// https://api.oneoff.akahu.io/v1/status/{code}

	const credentials = btoa(`${c.env.AKAHU_APP_TOKEN}:${c.env.AKAHU_APP_SECRET}`);
	const authorisationHeader = `Basic ${credentials}`;

	const page = await fetch(`https://api.oneoff.akahu.io/v1/status/${userToken}`, {
		headers: {
			Authorization: authorisationHeader,
			'Content-Type': 'application/json',
		},
	});

	if (!page.ok) {
		console.log('Failed to load transactions', page.status, page.statusText);
		throw new Error(`Failed to fetch transactions: ${page.status} ${page.statusText}`);
	}

	const data: any = await page.json();
	console.log(data);
	return data.item;
}
