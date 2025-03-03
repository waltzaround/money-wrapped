import type { SSE } from "./vender/see";

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

export function progressListen(sse: SSE, callback: (event: ProgressEvent) => void){
    sse.onmessage = (event) => {
        const data = JSON.parse(event.data || "{}");
        callback(data);
    };
}