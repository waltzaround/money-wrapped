import akahu from '@api/akahu';

import { Env } from '../types';
import { join } from 'path';

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
