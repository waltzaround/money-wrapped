import React from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";
import { Share2, Download, Repeat } from "lucide-react";

export default function FinalResultsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6">
      <div className="container max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Your 2023 Money Wrapped</h1>
          <p className="text-gray-300 text-lg">
            Thanks for exploring your spending journey!
          </p>
        </div>

        <div className="grid gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Key Highlights</CardTitle>
              <CardDescription className="text-gray-400">
                Your year in numbers
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-700 rounded-lg">
                <p className="text-gray-400">Total Spent</p>
                <p className="text-2xl font-bold text-emerald-400">$12,300</p>
              </div>
              <div className="p-4 bg-gray-700 rounded-lg">
                <p className="text-gray-400">Transactions</p>
                <p className="text-2xl font-bold text-blue-400">1,230</p>
              </div>
              <div className="p-4 bg-gray-700 rounded-lg">
                <p className="text-gray-400">Businesses</p>
                <p className="text-2xl font-bold text-purple-400">301</p>
              </div>
              <div className="p-4 bg-gray-700 rounded-lg">
                <p className="text-gray-400">Biggest Day</p>
                <p className="text-2xl font-bold text-pink-400">$432</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button className="flex-1 gap-2 text-black" variant="outline">
              <Share2 className="w-4 h-4" />
              Share Results
            </Button>
            <Button className="flex-1 gap-2 text-black" variant="outline">
              <Download className="w-4 h-4" />
              Download Report
            </Button>
          </div>

          <Button
            className="w-full gap-2 mt-4"
            variant="default"
            onClick={() => (window.location.href = "/")}
          >
            <Repeat className="w-4 h-4" />
            Start Over
          </Button>
        </div>

        <div className="mt-12 text-center text-sm text-gray-400">
          <p>Money Wrapped 2023</p>
          <p className="mt-2">
            All your financial data stays private and secure.
          </p>
        </div>
      </div>
    </div>
  );
}
