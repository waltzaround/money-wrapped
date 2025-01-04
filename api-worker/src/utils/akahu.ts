import akahu from '@api/akahu';

import { Env, HonoType } from '../types';
import { join } from 'path';
import { Context } from 'hono';

export const year = "2024";


interface AkahuEnrichedTransaction {
  type: string;
  merchant?: {
    name: string;
    id: string;
  };
  category?: {
    name: string;
    group: string;
  };
}

export async function enrichTransactions(transactions: Array<{
  id: string;
  description: string;
  amount: number;
  _connection: string;
  direction: 'debit';
}>, env: Env): Promise<Array<AkahuEnrichedTransaction>> {
  try {
    console.log('Authenticating with Akahu API...');
    if (!env.AKAHU_GENIE_TOKEN) {
      console.warn('No Akahu Genie token provided, skipping enrichment');
      return transactions.map(transaction => ({
        ...transaction,
        type: 'TRANSACTION'
      }));
    }

    akahu.auth(env.AKAHU_GENIE_TOKEN);

    // Process in batches of 1000
    const BATCH_SIZE = 1000;
    const enrichedTransactions: AkahuEnrichedTransaction[] = [];

    for (let i = 0; i < transactions.length; i += BATCH_SIZE) {
      const batch = transactions.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${i / BATCH_SIZE + 1} of ${Math.ceil(transactions.length / BATCH_SIZE)}`);

      const batchResults = await Promise.all(
        batch.map(async (transaction) => {
          try {
            const { data } = await akahu.genieSearch([{
              direction: 'DEBIT',
              description: transaction.description
            }]);

            if (data && data.length > 0) {
              const match = data[0];
              return {
                ...transaction,
                type: 'TRANSACTION',
                merchant: match.merchant,
                category: match.category
              };
            }
            return {
              ...transaction,
              type: 'TRANSACTION'
            };
          } catch (err) {
            console.error('Error enriching transaction:', err);
            return {
              ...transaction,
              type: 'TRANSACTION'
            };
          }
        })
      );

      enrichedTransactions.push(...batchResults);
    }

    return enrichedTransactions;
  } catch (error) {
    console.error('Error in enrichTransactions:', error);
    return transactions;
  }
}

export interface Transaction {
	_id: string;
	_account: string;
	_connection: string;
	date: string;
	description: string;
	type: "CARD" | "PAYMENT" | "TRANSFER" | "INTEREST" | "FEE" | "TAX" | "DIRECT CREDIT" | "DIRECT DEBIT" | "STANDING ORDER" | "ATM" | "FX" | "LOAN" | "KIWISAVER" | "CREDIT" | "DEBIT" | "UNKNOWN";
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
		const page = await fetch(`https://api.oneoff.akahu.io/v1/transactions/${userToken}${cursor ? `?cursor=${cursor}`: ""}`, {
			headers: {
				"Authorization": authorisationHeader,
				"Content-Type": "application/json",
				"Cursor": cursor
			}
		});

		if (!page.ok) {
			console.log("Failed to load transactions", page.status, page.statusText);
			throw new Error(`Failed to fetch transactions: ${page.status} ${page.statusText}`);
		}


		const data: any = (await page.json());
		console.log(data);
		cursor = data.cursor?.next;
		transactions.push(...data.items);
	} while (cursor);

	return transactions;
}
