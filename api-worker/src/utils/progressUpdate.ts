import { SSEMessage } from "hono/streaming"

export type  ProgressEvent = {
	event: "max-progress",
	progress: number
} | {
	event: "progress",
	message?: string,
	progress: number
} | {
	event: "result",
	data?: string,
	progress: number
} | {
	event: "error",
	message?: string,
	progress: number
};

export function ce(progressEvent: ProgressEvent): SSEMessage{
	return{
		event: "message",
		data: JSON.stringify(progressEvent),
	}
}
