import { Context } from 'hono';
import { z } from 'zod';
import { HonoType } from '../types';

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
};

export default handle;
