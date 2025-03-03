import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { API_URL } from "~/lib/api";
import { progressListen } from "~/lib/progressUpdates";
import lzString from "lz-string";
import {SSE} from "~/lib/vender/see";
import { ArrowLeft } from "lucide-react";

export default function LoadingPage() {
  let [maxSteps, setMaxSteps] = useState(3);

  let [currentStep, setCurrentStep] = useState(0);
  let progressBarValue = useMemo(() => {
    return Math.max((currentStep / maxSteps) * 100, 1);
  }, [currentStep, maxSteps]);
  let [message, setMessage] = useState("Connecting...");

  let [error, setError] = useState<string | undefined>(undefined);
  let [showDone, setShowDone] = useState<boolean>(false);
  let [transactions] = useState(localStorage.getItem("csv"));

  useEffect(() => {
    localStorage.removeItem("csv");
    console.log(transactions ? "Using transactions" : "Not using transactions");

    const sse = transactions
      ? new SSE(
          `${API_URL}/csv/transactions`,
          {method: "POST", payload: lzString.compressToEncodedURIComponent(
            transactions
          )}
        )
      : new SSE(`${API_URL}/akahu/transactions`, {
          withCredentials: true,
          method: "POST"
        });

    sse.onerror = (ev) => {
      console.error("SSE Error:", ev);
    };
    progressListen(sse, (event) => {
      console.log("Event:", event);
      if (event.event === "max-progress") {
        setMaxSteps(event.progress);
      } else if (event.event === "progress") {
        setCurrentStep(event.progress);
        setMessage(event.message || "");
      } else if (event.event === "result") {
        setCurrentStep(event.progress);
        if (event.data) {
          localStorage.setItem("results", event.data);
        }
        setShowDone(true);
        setMessage("Done!");
        sse.close();
      } else if (event.event === "error") {
        setError(event.message);
        sse.close();
      }
    });
    return () => sse.close();
  }, []);

  return (
    <div className="min-h-screen  p-6">
      <div className="container max-w-6xl mx-auto">
        <div className="flex flex-col items-center my-24">
          <h1 className="text-center text-4xl font-bold mb-4">
            Enriching Transactions
          </h1>
          <div className="w-[60%] min-w-60">
            <Progress
              value={progressBarValue}
              className={error ? "text-destructive" : undefined}
            />
            <div className="flex justify-between mt-2 text-gray-800">
              <span className="">{error || message}</span>
              <span>
                {currentStep}/{maxSteps}
              </span>
            </div>
          </div>
          {showDone ? (
            <Button asChild className="mt-4 bg-blue-700 text-white">
              <Link to="/results">View My Results</Link>
            </Button>
          ) : undefined}

          {error ? (
            <Button asChild className="mt-4 bg-blue-700 text-white">
              <Link to="/"><ArrowLeft/> Retry</Link>
            </Button>
            ) : undefined}
        </div>
      </div>
    </div>
  );
}
