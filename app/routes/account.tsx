import React from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";
import { Wallet, ClipboardList, LineChart, Info } from "lucide-react";
import { Header } from "~/components/header";

const REDIRECT_URI = 'https://funny.money.haxx.nz/akahu-auth';
const CLIENT_ID = 'app_token_cm53ibogp000308mh1ojb39u8';

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
                  Step 2: Select  accounts
                </CardTitle>
                <CardDescription>
                  Choose which bank accounts you'd like to include in your year-end review. 
                  You can select multiple accounts to get a complete picture of your spending.
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
                  Get insights about your spending habits, see your top merchants,
                  and discover interesting patterns in your financial year.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </div>
        <div className="flex items-center justify-center mb-6">
          <Info className="w-5 h-5 mr-2 text-primary" />
          <p className="text-center">The link below will take you to Akahu to start the Process</p>
        </div>


        <div className="flex justify-center">
          <a href={`https://oauth.akahu.nz?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=ONEOFF`}>
            <Button size="lg">Get Started</Button>
          </a>


        </div>
    
      </div>
    </>
  );
}
