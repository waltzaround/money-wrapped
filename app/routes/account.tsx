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
import { Header } from "~/components/header";

export default function PreparePage() {
  return (
    <>
      <Header />
      <div className="prepare-page p-6 container max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">How it works</h1>
        <div className="space-y-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Wallet className="w-12 h-12 text-primary" />
              <div>
                <CardTitle className="text-xl">
                  Step 1: Connect your account with Akahu
                </CardTitle>
                <CardDescription>
                  Log into your bank account with Akahu and choose the accounts
                  you want reviewed. It can only see your transactions, and
                  can't do anything else.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <ClipboardList className="w-12 h-12 text-primary" />
              <div>
                <CardTitle className="text-xl">
                  Step 2: Select the accounts you want to review
                </CardTitle>
                <CardDescription>
                  Log into your bank account with Akahu and choose the accounts
                  you want reviewed. It can only see your transactions, and
                  can't do anything else.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <LineChart className="w-12 h-12 text-primary" />
              <div>
                <CardTitle className="text-xl">Step 3: See results</CardTitle>
                <CardDescription>
                  Log into your bank account with Akahu and choose the accounts
                  you want reviewed. It can only see your transactions, and
                  can't do anything else.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </div>

        <div className="flex justify-center">
          <Button size="lg">Get Started</Button>
        </div>
      </div>
    </>
  );
}
