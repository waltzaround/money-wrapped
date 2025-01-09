import Fuse from "fuse.js";
import fuzzysort from "fuzzysort";
import { BANK_CONNECTIONS } from "../utils/akahu";
export { BANK_CONNECTIONS };

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
	[ColumnType.Debit]: ["debit","debit amount","debit transaction"],
	[ColumnType.Credit]: ["credit","credit amount","credit transaction"],
	[ColumnType.Details]: ["details","transaction details","transaction description","transaction details", "payee"],
	[ColumnType.Balance]: ["balance","account balance","account balance after transaction","account balance"],
	[ColumnType.AccountNumber]: ["account number","account"],
}

function break_into_words(value: string): string[] {
	const split = value.split(' ');
	if (split.length != 2) {
		return [value];
	}
	const [first, second] = split;

	return [`${second} ${first}`, `${first} ${second}`];
}

const descriptionsArray = Object.entries(descriptions).map(([key, value]) => value.map(break_into_words).flat().map(x=>({key, value: x}))).flat();
const fuse = new Fuse(descriptionsArray, {
	keys: ["value"],
	// return all results, we will filter them later
	threshold: Infinity,
	includeScore: true,
})
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

function matchValue(value: string): { key: string; score: number; } | null {

	const result = fuse.search(extremeNormalise(value));
	return result.length > 1 ? {key: result[0].item.key, score: result[0].score || NaN} : null;
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

function oneHeaderScan(rawHeaders: string[], data: any[][]): ParsingMeta{
	let result: ParsingMeta = {
		headers: [],
		account_id: null,
		row_number_used: 0
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

		let potential_match = matchValue(headerValue);

		if (potential_match && potential_match.score < 0.5) {
			header.type = Number.parseInt(potential_match.key) as ColumnType;
			header.confidence = potential_match.score;
		}

		result.headers.push(header);
	}

	return result;
}

export function intuteHeaders(data: any[][]): ParsingMeta | null {
	// Use row data to determine headers
	const firstRowSignature = oneHeaderScan(data[0], data.slice(1));
	const possibleMatch = bankSignatureMatch("", firstRowSignature);

	if (possibleMatch.dataColumns) {
		return {
			headers: possibleMatch.dataColumns.map((type) => ({type, name: "", confidence: 0.5})),
			account_id: null,
			row_number_used: 0
		}
	}

	return null
}

export function loadHeaders(rawHeaders: string[], data: any[][], depth: number): ParsingMeta{
    // Skip account number line for Kiwibank
    if (rawHeaders.length === 1 && rawHeaders[0].match(/\d{2}-\d{4}-\d{7}-\d{2}/)) {
        return loadHeaders(data[0], data.slice(1), depth + 1);
    }

    let meta = oneHeaderScan(rawHeaders, data);
    if (!validHeaders(meta.headers)) {

		// Some banks hide the header super deep into the CSV, there's no harm in looking for it
        if (depth < 10 && data.length > 0) {
            return loadHeaders(data[0], data.slice(1), depth + 1);
        }
        throw new Error('Could not find valid headers');
    }
    meta.row_number_used = depth;
    return meta;
}

const rawHeaderBankMap = {
	"Account number,Date,Memo/Description,Source Code (payment type),TP ref,TP part,TP code,OP ref,OP part,OP code,OP name,OP Bank Account Number,Amount (credit),Amount (debit),Amount,Balance": BANK_CONNECTIONS.Kiwibank,
	"Date,Description,,Amount,Balance": BANK_CONNECTIONS.Kiwibank,
	"Date,Unique Id,Tran Type,Cheque Number,Payee,Memo,Amount": BANK_CONNECTIONS.ASB,
	"Transaction Date,Unique Id,Transaction Type,Cheque Number,Payee,Particulars,Code,Reference,Amount,Date Processed,Foreign Currency Amount,Conversion Charge": BANK_CONNECTIONS.ANZ,
	"Date,Amount,Other Party,Description,Reference,Particulars,Analysis Code": BANK_CONNECTIONS.Westpac,
	"Date,Amount,Payee,Particulars,Code,Reference,Tran Type,This Party Account,Other Party Account,Serial,Transaction Code,Batch Number,Originating Bank/Branch,Processed Date": BANK_CONNECTIONS.BNZ
}
const parsedHeaderBankMap = [
	{
		bank: BANK_CONNECTIONS.Kiwibank,
		columns: [ColumnType.AccountNumberData, ColumnType.Empty, ColumnType.Empty, ColumnType.Empty, ColumnType.Empty],
		dataColumns: [ColumnType.Date, ColumnType.Details, ColumnType.Empty, ColumnType.Amount, ColumnType.Balance]
	},
	{
		bank: BANK_CONNECTIONS.Westpac,
		columns: [
			ColumnType.Date,          // Date
			ColumnType.Amount,        // Amount
			ColumnType.Details,       // Other Party
			ColumnType.Details,       // Description
			ColumnType.Details,       // Reference
			ColumnType.Details,       // Particulars
			ColumnType.Empty         // Analysis Code
		],
		dataColumns: [
			ColumnType.Date,          // Use Date
			ColumnType.Amount,        // Use Amount
			ColumnType.Details,       // Use Other Party as primary description
			ColumnType.Details        // Use Description as backup
		]
	}
]

interface SignatureMatch {
	bank: BANK_CONNECTIONS;
	dataColumns?: ColumnType[];
}

export function bankSignatureMatch(csv: string, meta: ParsingMeta): SignatureMatch {
	let raw_line = csv.split('\n')[meta.row_number_used].trim();

	for (let [signature, bank] of Object.entries(rawHeaderBankMap)) {
		if (raw_line === signature) {
			return {bank};
		}
	}

	// Check fuzzier parsed headers
	for (let {bank, columns, dataColumns} of parsedHeaderBankMap) {
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
			return {bank, dataColumns};
		}
	}

	return {bank: BANK_CONNECTIONS.UNKNOWN};
}
