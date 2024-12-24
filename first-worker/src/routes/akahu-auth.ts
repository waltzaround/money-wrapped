import { corsHeaders } from '../utils/cors';
import { Env } from '../types';

export async function handleAkahuAuth(request: Request, env: Env, origin: string): Promise<Response> {
	const akahuAuthUrl = 'https://api.oneoff.akahu.io/v1/auth';
	return Response.redirect(akahuAuthUrl, 302);
}
