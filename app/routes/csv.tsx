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
        <h1 className="text-3xl font-bold mb-6">Upload transactions</h1>
        <div className="space-y-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Wallet className="w-12 h-12 text-primary" />
              <div>
                <CardTitle className="text-xl">
                  Drag your CSV file here
                </CardTitle>
                <CardDescription>
                  You can find this in your bank's online banking portal.
                </CardDescription>
              </div>
            </CardHeader>
            <div className="p-4 border-t">
              <Button size="lg">Get Started</Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
