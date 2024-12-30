import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { validator } from 'hono/validator';
import uploadCsvHandler, { bodyValidator as uploadCsvBody } from './routes/upload-csv';
import authCallbackHandler from './routes/akahu-auth';
import { HonoType } from './types';

const app = new Hono<HonoType>();

app.use(
	cors({
		origin: ['http://localhost:5173', 'https://money.haxx.nz'],
		allowHeaders: ['Content-Type'],
		allowMethods: ['GET', 'POST', 'OPTIONS'],
	}),
);

app.get('/akahu-auth', authCallbackHandler);

app.get('/app-url', (c) => c.json({ url: c.env.APP_URL }));

app.post(
	'/upload-csv',
	validator('form', (value, c) => {
		const parsed = uploadCsvBody.safeParse(value);
		if (!parsed.success) {
			return c.json({ success: false, errors: parsed.error.issues.map((issue) => issue.path + ': ' + issue.message) }, 400);
		}

		return parsed.data;
	}),
	uploadCsvHandler,
);

export default app;
