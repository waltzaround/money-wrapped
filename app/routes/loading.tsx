import { useEffect, useMemo, useState } from "react";
import { Progress } from "~/components/ui/progress";
import { API_URL } from "~/lib/api";
import { progressListen } from "~/lib/progressUpdates";

export default function LoadingPage() {
    let [maxSteps, setMaxSteps] = useState(3);

    let [currentStep, setCurrentStep] = useState(0);
    let progressBarValue = useMemo(() => {
        return Math.max(currentStep / maxSteps * 100, 1);
    }, [currentStep, maxSteps]);
    let [message, setMessage] = useState("Connecting...");

    let [error, setError] = useState<string | undefined>(undefined);


    useMemo(() => {
        const sse = new EventSource(`${API_URL}/akahu/transactions`, { withCredentials: true });
        sse.onerror = ((ev) => {
            console.error("SSE Error:", ev);
        });
        progressListen(sse, (event) => {
            console.log("Event:", event)
            if (event.event === "max-progress") {
                setMaxSteps(event.progress);
            } else if (event.event === "progress") {
                setCurrentStep(event.progress);
                setMessage(event.message || "");
            } else if (event.event === "result") {
                setCurrentStep(event.progress);
                setMessage("Done!");
                sse.close();
            } else if (event.event === "error") {
                setError(event.message);
                sse.close();
            }
        });
        return () => sse.close();
    }, []);


    return <div className="min-h-screen  p-6">
        <div className="container max-w-6xl mx-auto">
            <div className="flex flex-col items-center my-24">
                <h1 className="text-center text-4xl font-bold mb-4">Enriching Transactions</h1>
                <div className="w-[60%] min-w-60">
                    <Progress value={progressBarValue} className={error ? "text-destructive" : undefined}/>
                    <div className="flex justify-between mt-2 text-gray-800">
                        <span className="">
                            {error || message}
                        </span>
                        <span>
                            {currentStep}/{maxSteps}

                        </span>

                    </div>
                </div>
            </div>
        </div>
    </div>
}