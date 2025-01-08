import type { GenieSearchBodyParam } from "@api/akahu";
import { parse } from "csv-parse";
import Sugar from "sugar";
import Fuse from 'fuse.js'
import { bankSignatureMatch, ColumnType, intuteHeaders, loadHeaders, ParsingMeta } from "./csvHeaders";
import { bankFilter } from "./bankFilter";

export interface RawTransaction {
	id: string;
	description: string;
	direction: 'debit' | 'credit';
	date: string;
	amount: number;
	_connection: GenieSearchBodyParam[number]['_connection'];
}


export async function parseCSV(csv: string, id: number): Promise<RawTransaction[]> {
	const parseResult = parse(csv, {
		cast: true,
		columns: false,
		skip_empty_lines: true,
		trim: true,
		relax_quotes: true,
		relax_column_count: true,

	});


	const records: any[][] = [];
	for await (const record of parseResult) {
		records.push(record);
	}
	console.log('Parsed record:', records);

	let parsingMeta: ParsingMeta | null = null;

	try {
		parsingMeta = loadHeaders(records[0], records.slice(1), 0);
	} catch (e) {
		console.error('Error loading headers:', e);
	}

	if (!parsingMeta) {
		parsingMeta = intuteHeaders(records);
	}

	if (!parsingMeta) {
		console.error('Could not determine headers');
		return [];
	}

	let connectionId = bankSignatureMatch(csv, parsingMeta);


	const parsedTransactions: RawTransaction[] = records.slice(parsingMeta.row_number_used + 1)
		.map((item, count) => {
			console.log('Processing transaction:', item);

			let headers = Array.from(parsingMeta.headers.entries());

			let parsedDate: Date | null = null;
			for (let [i,dateHeaders] of headers.filter(([,x]) => x.type === ColumnType.Date)) {
				let date = item[i];
				let attempt = Sugar.Date.create(date, {
					locale: 'en-AU',
					past: true,
				});
				if (date && !isNaN(attempt.getTime()) ) {
					parsedDate = attempt;
					break;
				}
			}

			if (!parsedDate) {
				return undefined;
			}

			let description = [];
			for (let [i, detailsHeaders] of headers.filter(([,x]) => x.type === ColumnType.Details)) {
				if (typeof item[i] === 'string') {
					description.push(item[i]);
				}
			}
			if (description.length === 0) {
				return undefined;
			}

			// Find the longest description
			let parsedDescription = description.reduce(
				function (a, b) {
					return a.length > b.length ? a : b;
				}
			)

			// Negative = Spend (Debit), Positive = Income (Credit)
			let amount: number = 0;
			// Merge together sources, prefering credit & debit
			for (let [i, amountHeaders] of headers.filter(([,x]) => [ColumnType.Debit, ColumnType.Credit].includes(x.type))) {
				let value = parseFloat(item[i]);
				if (isNaN(value)) {
					continue;
				}
				if (amountHeaders.type === ColumnType.Debit) {
					value = -Math.abs(value);
				} else if (amountHeaders.type === ColumnType.Credit) {
					value = Math.abs(value);
				}

				amount += value;
			}

			// If we couldn't find an amount, try the amount column
			if (amount === 0) {
				for (let [i, amountHeaders] of headers.filter(([,x]) => x.type === ColumnType.Amount)) {
					let value = parseFloat(item[i]);
					if (isNaN(value)) {
						continue;
					}
					amount += value;
				}
			}

			// no money :(
			if (amount === 0) {
				return undefined;
			}



			const transaction: RawTransaction = {
				id: `tx_${parsedDate.toISOString()}_${id}_${count}`,
				description: parsedDescription,
				direction: amount < 0 ? 'debit' : 'credit',
				date: parsedDate.toISOString(),
				amount: amount,
				_connection: connectionId.bank as RawTransaction['_connection'],
			};
			return transaction;
		})
		.filter((x) => x !== undefined).filter(bankFilter);

	return parsedTransactions;
}
