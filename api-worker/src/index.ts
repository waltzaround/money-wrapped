import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { validator } from 'hono/validator';
import uploadCsvHandler, { bodyValidator as uploadCsvBody } from './routes/upload-csv';
import authInitHandler from './routes/auth/init';
import authCallbackHandler from './routes/auth/callback';
import { HonoType } from './types';

const app = new Hono<HonoType>();

app.use(
	cors({
		origin: ['http://localhost:5173', 'https://money.haxx.nz'],
		allowHeaders: ['Content-Type'],
		allowMethods: ['GET', 'POST', 'OPTIONS'],
	}),
);

app.get('/auth/init', authInitHandler);

app.get('/auth/callback', authCallbackHandler);

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
