import { BANK_CONNECTIONS, Transaction } from "../utils/akahu";
import { RawTransaction } from "./csvParse";

const bankFilters = {
	[BANK_CONNECTIONS.Kiwibank]: (transaction: RawTransaction) => {
		// Internal transfers
		return !transaction.description.startsWith('TRANSFER TO') && !transaction.description.startsWith('TRANSFER FROM');
	},
	[BANK_CONNECTIONS.ASB]: (transaction: RawTransaction) => {
		// Internal transfers
		return !transaction.description.startsWith('TRANSFER TO') && !transaction.description.startsWith('TRANSFER FROM');
	},
}

export function bankFilter(transaction: RawTransaction): boolean {
	const connectionID = transaction._connection ?? "";
	if (connectionID in bankFilters) {
		const filter = bankFilters[connectionID as keyof typeof bankFilters];
		return filter(transaction);
	}

	return true;
}
