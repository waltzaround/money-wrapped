import { Context } from 'hono';
import { z } from 'zod';
import { HonoType } from '../types';
import { parse } from 'csv-parse';

export const bodyValidator = z.object({
	files: z.array(z.instanceof(File)).or(z.instanceof(File).transform((file) => [file])),
});

const handle = async (
	c: Context<
		HonoType,
		'/upload-csv',
		{
			in: {
				form: z.infer<typeof bodyValidator>;
			};
			out: {
				form: z.infer<typeof bodyValidator>;
			};
		}
	>,
) => {
	const data = c.req.valid('form');

	const csvs = await Promise.all(data.files.map((x) => x.text()));
	const transactions: { id: string; description: string; direction: 'debit'; date: string; amount: number }[] = [];

	let count = 0;

	for (const csv of csvs) {
		let dateColumn: string;
		let amountColumn: string;
		let detailsColumn: string;

		transactions.push(
			...(await parse(csv, { cast: true, cast_date: true, columns: true })
				.map((item) => {
					if (dateColumn === undefined) {
						dateColumn = Object.keys(item).find((x) => x.toLowerCase().includes('date'))!;
					}

					if (amountColumn === undefined) {
						amountColumn = Object.keys(item).find((x) => x.toLowerCase().includes('amount'))!;
					}

					if (detailsColumn === undefined) {
						detailsColumn = Object.keys(item).find((x) => x.toLowerCase().includes('details'))!;
					}

					let amount = item[amountColumn];
					let date = item[dateColumn];
					let description = item[detailsColumn];

					if (!(date instanceof Date) || date.getFullYear() != 2024) {
						return undefined;
					}

					count++;
					return {
						id: `tx_${date.toLocaleDateString()}_${count}`,
						description: description,
						direction: 'debit',
						date: date.toLocaleDateString(),
						amount,
					};
				})
				.filter((x) => x !== undefined)
				.toArray()),
		);
	}

	console.log(transactions);

	return c.json({ success: true });
};

export default handle;
