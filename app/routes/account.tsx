import React from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";
import { Wallet, ClipboardList, LineChart } from "lucide-react";

export default function PreparePage() {
  return (
    <div className="prepare-page p-6 container max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">How it works</h1>
      <div className="space-y-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Wallet className="w-12 h-12 text-primary" />
            <div>
              <CardTitle className="text-xl">
                Step 1: Connect your bank account
              </CardTitle>
              <CardDescription>
                Log into your bank account with Akahu and choose the accounts
                you want reviewed. It can only see your transactions, and can't
                do anything else.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>

        <Card className="p-8 py-4 flex flex-row items-center gap-4">
          <ClipboardList className="w-12 h-12 text-primary" />
          <div className="">
            <CardHeader className="flex flex-row items-center gap-4">
              <div>
                <CardTitle>Review Transactions</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View and categorize your transactions from the past year.
              </p>
            </CardContent>
          </div>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <LineChart className="w-8 h-8 text-primary" />
            <div>
              <CardTitle>Generate Insights</CardTitle>
              <CardDescription>Discover your spending habits</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Get detailed analytics about where your money goes.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button size="lg">Get Started</Button>
      </div>
    </div>
  );
}
