import { Context } from 'hono';
import { z } from 'zod';
import { HonoType } from '../types';
import { parse } from 'csv-parse';
import { DateTime } from 'luxon';
import { parseCSV, RawTransaction } from '../analytics/csvParse';

export const bodyValidator = z.object({
	files: z.array(z.instanceof(File)).or(z.instanceof(File).transform((file) => [file])),
	connection: z.string().optional(),
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
	console.log('Form data:', data);

	const csvs = await Promise.all(data.files.map((x) => x.text()));
	const transactions: RawTransaction[] = [];

	for (const [id, csv] of csvs.entries()) {
		transactions.push(...(await parseCSV(csv, id)));
	}

	return c.json({ success: true, transactions });
};

export default handle;
