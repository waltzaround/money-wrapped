import Fuse from "fuse.js";
import fuzzysort from "fuzzysort";
import { BANK_CONNECTIONS } from "../utils/akahu";

export enum ColumnType {
	Date,
	Amount,
	Debit,
	Credit,
	Details,
	Balance,
	AccountNumber,
	AccountNumberData,
	Empty,
	Unknown
}

export const descriptions = {
	[ColumnType.Date]: ["date","transaction date","date of transaction","transaction date"],
	[ColumnType.Amount]: ["amount","transaction amount"],
	[ColumnType.Debit]: ["debit","debit amount","debit transaction","debit amount"],
	[ColumnType.Credit]: ["credit","credit amount","credit transaction","credit amount"],
	[ColumnType.Details]: ["details","transaction details","transaction description","transaction details", "payee"],
	[ColumnType.Balance]: ["balance","account balance","account balance after transaction","account balance"],
	[ColumnType.AccountNumber]: ["account number","account"],
}

export interface Header {
	type: ColumnType;
	name: string;
	confidence: number;
}

export interface ParsingMeta {
	headers: Header[];
	account_id: string | null;
	row_number_used: number;
}

function extremeNormalise(value: string): string {
	return value.normalize().toLowerCase().replace(/[^a-z\s]/g, '');
}

function matchValue(value: string, potentials: string[]): number {
	const result = fuzzysort.go(value, potentials, {all: true});
	return Math.max(...result.map(x => x.score), 0);
}

function validHeaders(headers: Header[]): boolean {
	let date = headers.find(x => x.type === ColumnType.Date);
	let amount = headers.find(x => [ColumnType.Amount, ColumnType.Debit, ColumnType.Credit].includes(x.type));
	let details = headers.find(x => x.type === ColumnType.Details);

	return date !== undefined && amount !== undefined && details !== undefined;
}

function checkForAccountNumber(value: string): boolean {
	const re = /\d{2}[-—._ ]\d{4}[-—._ ]\d{7}[-—._ ]\d{2,3}/;
	return re.test(value);
}

export function intuteHeaders(data: any[][]): ParsingMeta | null {
	// Use row data to determine headers

	return null
}

export function loadHeaders(rawHeaders: string[], data: any[][], depth: number): ParsingMeta{
	if (depth >= 10) {
		console.log('Could not find headers after 3 attempts, giving up');
		throw new Error('Could not find headers');
	}

	console.log(`[DEPTH: ${depth}] Attempting to load headers: ${rawHeaders}`);

	let result: ParsingMeta = {
		headers: [],
		account_id: null,
		row_number_used: depth
	}

	for (let headerValue of rawHeaders) {
		let header: Header = {
			type: ColumnType.Unknown,
			name: headerValue,
			confidence: 0
		};

		if (!headerValue) {
			header.type = ColumnType.Empty;
			header.confidence = 0;
			result.headers.push(header);
			continue;
		}

		if (typeof headerValue !== 'string') {
			header.type = ColumnType.Unknown;
			header.confidence = 1;
			result.headers.push(header);
			continue
		}

		if (checkForAccountNumber(headerValue)) {
			result.account_id = headerValue;
			header.confidence = 1;
			header.type = ColumnType.AccountNumberData;
			result.headers.push(header);
			continue;
		}

		for (const [key, value] of Object.entries(descriptions)) {
			let columnType = Number.parseInt(key) as ColumnType;
			let confidence = matchValue(headerValue, value);

			if (confidence > 0.45 && confidence > header.confidence) {
				header.type = columnType;
				header.confidence = confidence;
			}
		}

		result.headers.push(header);
	}

	const valid = validHeaders(result.headers);
	if (!valid) {
		return loadHeaders(data[0], data.slice(1), depth + 1);
	}

	console.log('Loaded headers!', result.headers);

	return result;
}

const rawHeaderBankMap = {
	"Account number,Date,Memo/Description,Source Code (payment type),TP ref,TP part,TP code,OP ref,OP part,OP code,OP name,OP Bank Account Number,Amount (credit),Amount (debit),Amount,Balance": BANK_CONNECTIONS.Kiwibank,
	"Date,Unique Id,Tran Type,Cheque Number,Payee,Memo,Amount": BANK_CONNECTIONS.ANZ
}
const parsedHeaderBankMap = [
	{
		bank: BANK_CONNECTIONS.Kiwibank,
		columns: [ColumnType.AccountNumberData, ColumnType.Empty, ColumnType.Empty, ColumnType.Empty, ColumnType.Empty]
	}
]

export function bankSignatureMatch(csv: string, meta: ParsingMeta): BANK_CONNECTIONS {
	let raw_line = csv.split('\n')[meta.row_number_used].trim();

	for (let [signature, bank] of Object.entries(rawHeaderBankMap)) {
		if (raw_line === signature) {
			return bank;
		}
	}

	// Check fuzzier parsed headers
	for (let {bank, columns} of parsedHeaderBankMap) {
		if (columns.length !== meta.headers.length) {
			continue;
		}

		let match = true;
		for (let [i, column] of columns.entries()) {
			if (column !== meta.headers[i].type) {
				match = false;
				break;
			}
		}

		if (match) {
			return bank;
		}
	}

	return BANK_CONNECTIONS.UNKNOWN;
}
