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

export async function enrichTransactions(transactions: Array<{ description: string; amount: number }>, env: Env): Promise<Array<AkahuEnrichedTransaction>> {
  const baseUrl = 'https://api.oneoff.akahu.io/v1';
  
  try {
    // Using vars from wrangler.toml through env
    const credentials = Buffer.from(`${env.AKAHU_APP_TOKEN}:${env.AKAHU_APP_SECRET}`).toString('base64');

    console.log('Authenticating with Akahu API...');

    console.log('Akahu API credentials:', credentials);
    
    const authResponse = await fetch(`${baseUrl}/auth`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      }
    });

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      throw new Error(`Auth failed: ${authResponse.status} ${errorText}`);
    }

    const authData = await authResponse.json();
    const authCode = authData.code;

    if (!authCode || !authCode.startsWith('id_')) {
      throw new Error('Invalid auth code received');
    }

    console.log('Successfully obtained auth code');

    // Only prepare and enrich transactions after successful authentication
    const items = transactions.map(t => ({
      description: t.description,
      amount: Math.abs(t.amount), // Akahu expects positive amounts
    }));

    console.log('Starting transaction enrichment for', items.length, 'items');
    console.log('Sample transaction:', items[0]);
    
    // Make the enrichment request with the auth code
    const response = await fetch(`${baseUrl}/transactions/${authCode}`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items }),
    });

    console.log('Akahu API response status:', response.status);
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Akahu API error details:', {
        status: response.status,
        statusText: response.statusText,
        error
      });
      throw new Error(`Akahu API error: ${response.status}`);
    }

    const enrichedData = await response.json() as { items: AkahuEnrichedTransaction[] };
    console.log('Successfully enriched transactions. Sample result:', enrichedData.items[0]);
    return enrichedData.items;
  } catch (error) {
    console.error('Error enriching transactions:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    // Return empty enrichment data rather than failing
    return transactions.map(() => ({ type: 'unknown' }));
  }
}
