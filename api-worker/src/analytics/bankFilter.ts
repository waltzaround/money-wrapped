import { BANK_CONNECTIONS, Transaction } from "../utils/akahu";
import { RawTransaction } from "./csvParse";

const bankFilters = {
	[BANK_CONNECTIONS.Kiwibank]: (transaction: RawTransaction | Transaction) => {
		// Internal transfers
		return !transaction.description.startsWith('TRANSFER TO') && !transaction.description.startsWith('TRANSFER FROM');
	},
	[BANK_CONNECTIONS.ASB]: (transaction: RawTransaction | Transaction) => {
		// Debug logging
		console.log('ASB Transaction:', {
			description: transaction.description,
			shouldFilter: transaction.description.includes('MB TRANSFER') ||
				transaction.description.includes('TFR OUT') ||
				transaction.description.startsWith('TRANSFER TO') ||
				transaction.description.startsWith('TRANSFER FROM')
		});

		// Internal transfers - return false to filter OUT the transaction
		return !(
			transaction.description.includes('MB TRANSFER') ||
			transaction.description.includes('TFR OUT') ||
			transaction.description.startsWith('TRANSFER TO') ||
			transaction.description.startsWith('TRANSFER FROM')
		);
	},
	[BANK_CONNECTIONS.BNZ]: (transaction: RawTransaction | Transaction) => {
		// Debug logging
		console.log('BNZ Transaction:', {
			description: transaction.description,
			type: (transaction as any).type,
			shouldFilter: (transaction as any).type === 'INTERNET XFR'
		});

		// Filter out internal transfers (INTERNET XFR)
		return (transaction as any).type !== 'INTERNET XFR';
	},
}

export function bankFilter(transaction: RawTransaction | Transaction): boolean {
	const connectionID = transaction._connection ?? "";
	console.log('Bank Detection:', {
		connectionID,
		isASB: connectionID === BANK_CONNECTIONS.ASB,
		availableBanks: BANK_CONNECTIONS
	});

	if (connectionID in bankFilters) {
		const filter = bankFilters[connectionID as keyof typeof bankFilters];
		return filter(transaction);
	}

	return true;
}
