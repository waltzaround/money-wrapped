import React from "react";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";
import { Share2, Download } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

import { cn } from "~/lib/utils";

type SpendCategory = {
  category: string;
  amount: number;
  color: string;
};

export default function FinalResultsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");

  const spendingData = {
    monthly: [
      { period: "Jan", amount: 1000 },
      { period: "Feb", amount: 900 },
      { period: "Mar", amount: 1100 },
      { period: "Apr", amount: 950 },
      { period: "May", amount: 1200 },
      { period: "Jun", amount: 1050 },
      { period: "Jul", amount: 1300 },
      { period: "Aug", amount: 1150 },
      { period: "Sep", amount: 1000 },
      { period: "Oct", amount: 1250 },
      { period: "Nov", amount: 1100 },
      { period: "Dec", amount: 1300 },
    ],
    weekly: Array.from({ length: 52 }, (_, i) => {
      // Calculate the start date of each week
      const startDate = new Date(2024, 0, i * 7 + 1); // Jan 1, 2024 + weeks
      const endDate = new Date(2024, 0, i * 7 + 7);

      // Format the dates as "Jan 1 - Jan 7"
      const formattedPeriod = `${startDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} - ${endDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}`;

      // Generate spending amount (keeping the same logic)
      const weekNumber = i + 1;
      const baseAmount = 250;
      const monthPosition = (weekNumber % 4) / 4;
      const monthlyVariation = Math.sin(monthPosition * Math.PI) * 50;
      const seasonalVariation = Math.sin((weekNumber / 52) * 2 * Math.PI) * 100;
      const randomness = Math.random() * 60 - 30;
      const amount = Math.round(
        baseAmount + monthlyVariation + seasonalVariation + randomness
      );

      return {
        period: formattedPeriod,
        amount: Math.max(150, amount),
      };
    }),
    daily: Array.from({ length: 365 }, (_, i) => {
      const date = new Date(2024, 0, i + 1);
      const formattedDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const baseAmount = 45;
      const variation = Math.sin(i / 7) * 20;
      const randomness = Math.random() * 30 - 15;
      const amount = Math.round(baseAmount + variation + randomness);

      return {
        period: formattedDate,
        amount: Math.max(20, amount),
      };
    }),
  };

  const spendCategories: SpendCategory[] = [
    { category: "Rent", amount: 6000, color: "bg-blue-500" },
    { category: "Groceries", amount: 3000, color: "bg-emerald-500" },

    { category: "Dining Out", amount: 1600, color: "bg-rose-500" },
    { category: "Entertainment", amount: 1500, color: "bg-orange-500" },
    { category: "Utilities", amount: 1200, color: "bg-purple-500" },
  ];

  return (
    <div className="min-h-screen  p-6">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center my-24">
          <h1 className="text-4xl font-bold mb-4">Your 2024 Money Wrapped</h1>
          <p className="text-gray-900 text-lg">
            Thanks for exploring your spending journey!
          </p>
        </div>

        <div className="grid gap-6">
          <Card className="bg-white border shadow-sm">
            <CardHeader>
              <CardTitle className="">Key Highlights</CardTitle>
              <CardDescription className="">
                Your year in numbers
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50 rounded-lg">
                <p className="text-gray-700">Total Spent</p>
                <p className="text-2xl font-bold text-emerald-600">$12,300</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-gray-700">Transactions</p>
                <p className="text-2xl font-bold text-blue-600">1,230</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-gray-700">Businesses</p>
                <p className="text-2xl font-bold text-purple-600">301</p>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg">
                <p className="text-gray-700">Biggest Day</p>
                <p className="text-2xl font-bold text-pink-600">$432</p>
              </div>
            </CardContent>
          </Card>
          {/* <div className="flex gap-4">
            <Button className="flex-1 gap-2 text-black" variant="outline">
              <Share2 className="w-4 h-4" />
              Share Results
            </Button>
            <Button className="flex-1 gap-2 text-black" variant="outline">
              <Download className="w-4 h-4" />
              Download Report
            </Button>
          </div> */}
          <div className="w-full rounded-md border min-h-40 bg-white">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold ">Spending Breakdown</h2>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select time period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">By Month</SelectItem>
                  <SelectItem value="weekly">By Week</SelectItem>
                  <SelectItem value="daily">By Day</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4 h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  width={500}
                  height={300}
                  data={
                    spendingData[selectedPeriod as keyof typeof spendingData]
                  }
                >
                  <XAxis
                    dataKey="period"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-white p-2 shadow-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="font-medium">
                                {payload[0].payload.period}
                              </div>
                              <div className="text-right font-medium">
                                ${payload[0].value}
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="amount"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    className="fill-emerald-500 hover:fill-emerald-600"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="aspect-[9/16] rounded-xl border p-8 bg-gradient-to-b from-emerald-100 to-emerald-200 text-gray-800 flex flex-col items-center justify-center">
              <p className="text-lg text-emerald-700 mb-2">
                This year you spent
              </p>
              <p className="text-5xl font-bold mb-2 text-emerald-800">
                $12,300
              </p>
              <p className="text-lg text-emerald-700">on purchases</p>
            </div>

            <div className="col-span-2 rounded-xl  flex flex-col p-8 bg-emerald-50 text-gray-800 border">
              <h3 className="text-2xl font-bold text-emerald-700 mb-6">
                Your Top 10 Merchants
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600">#1</span>
                    <span className="font-medium text-gray-800">
                      McDonald's
                    </span>
                  </div>
                  <span className="text-gray-700">$1,230</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600">#2</span>
                    <span className="font-medium text-gray-800">Countdown</span>
                  </div>
                  <span className="text-gray-700">$980</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600">#3</span>
                    <span className="font-medium text-gray-800">BP</span>
                  </div>
                  <span className="text-gray-700">$850</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600">#4</span>
                    <span className="font-medium text-gray-800">Kmart</span>
                  </div>
                  <span className="text-gray-700">$720</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600">#5</span>
                    <span className="font-medium text-gray-800">
                      The Warehouse
                    </span>
                  </div>
                  <span className="text-gray-700">$690</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600">#6</span>
                    <span className="font-medium text-gray-800">Pak'nSave</span>
                  </div>
                  <span className="text-gray-700">$580</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600">#7</span>
                    <span className="font-medium text-gray-800">Z Energy</span>
                  </div>
                  <span className="text-gray-700">$520</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600">#8</span>
                    <span className="font-medium text-gray-800">Bunnings</span>
                  </div>
                  <span className="text-gray-700">$480</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600">#9</span>
                    <span className="font-medium text-gray-800">Mitre 10</span>
                  </div>
                  <span className="text-gray-700">$450</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600">#10</span>
                    <span className="font-medium text-gray-800">New World</span>
                  </div>
                  <span className="text-gray-700">$420</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1 aspect-[9/16] rounded-xl border p-8 bg-gradient-to-b from-orange-100 to-orange-200 text-gray-800 flex flex-col items-center justify-center">
              <p className="text-lg text-orange-700 mb-2">
                You spend on average about
              </p>
              <p className="text-5xl font-bold mb-2">$110</p>
              <p className="text-lg text-orange-700">every weekend</p>
            </div>
            <div className="flex-1 aspect-[9/16] rounded-xl border  p-8 bg-gradient-to-b from-lime-200 to-lime-100 text-white flex flex-col items-center justify-center">
              <p className="text-lg text-lime-700 mb-2">You visited a cafe</p>

              <p className="text-5xl font-bold text-lime-800  mb-2">
                110 times
              </p>
              <p className="text-lg text-lime-700 text-center">This year</p>
            </div>
            <div className="flex-1 aspect-[9/16] rounded-xl border p-8 bg-gradient-to-b from-purple-100 to-purple-200 text-gray-800 flex flex-col items-center justify-center">
              <p className="text-lg text-purple-700 mb-2">You made</p>
              <p className="text-5xl font-bold mb-2">1,230</p>
              <p className="text-lg text-purple-700">transactions</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 rounded-xl  flex flex-col p-8 bg-blue-50 text-gray-800 border">
              <h3 className="text-2xl font-bold text-blue-700 mb-6">
                Your Top 10 Restaurants &amp; Cafes
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">#1</span>
                    <span className="font-medium text-gray-800">
                      McDonald's
                    </span>
                  </div>
                  <span className="text-gray-700">$1,230</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">#2</span>
                    <span className="font-medium text-gray-800">Countdown</span>
                  </div>
                  <span className="text-gray-700">$980</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">#3</span>
                    <span className="font-medium text-gray-800">BP</span>
                  </div>
                  <span className="text-gray-700">$850</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">#4</span>
                    <span className="font-medium text-gray-800">Kmart</span>
                  </div>
                  <span className="text-gray-700">$720</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">#5</span>
                    <span className="font-medium text-gray-800">
                      The Warehouse
                    </span>
                  </div>
                  <span className="text-gray-700">$690</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">#6</span>
                    <span className="font-medium text-gray-800">Pak'nSave</span>
                  </div>
                  <span className="text-gray-700">$580</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">#7</span>
                    <span className="font-medium text-gray-800">Z Energy</span>
                  </div>
                  <span className="text-gray-700">$520</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">#8</span>
                    <span className="font-medium text-gray-800">Bunnings</span>
                  </div>
                  <span className="text-gray-700">$480</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">#9</span>
                    <span className="font-medium text-gray-800">Mitre 10</span>
                  </div>
                  <span className="text-gray-700">$450</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">#10</span>
                    <span className="font-medium text-gray-800">New World</span>
                  </div>
                  <span className="text-gray-700">$420</span>
                </div>
              </div>
            </div>
            <div className="flex-1 aspect-[9/16] rounded-xl border p-8 bg-gradient-to-b from-blue-100 to-blue-200 text-gray-800 flex flex-col items-center justify-center">
              <p className="text-lg text-blue-700 mb-2">You shopped at</p>
              <p className="text-5xl font-bold mb-2">301</p>
              <p className="text-lg text-blue-700">different businesses</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="aspect-[9/16] rounded-xl border p-8 bg-gradient-to-b from-emerald-100 to-emerald-200 text-gray-800 flex flex-col items-center justify-center">
              <p className="text-lg text-emerald-700 mb-2">
                This year you spent
              </p>
              <p className="text-5xl font-bold mb-2 text-emerald-800">
                $12,300
              </p>
              <p className="text-lg text-emerald-700">on purchases</p>
            </div>

            <div className="col-span-2 rounded-xl  flex flex-col p-8 bg-emerald-50 text-gray-800 border">
              <h3 className="text-2xl font-bold text-emerald-700 mb-6">
                Largest transactions this year
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600">#1</span>
                    <span className="font-medium text-gray-800">
                      December 23{" "}
                      <span className="text-gray-500 text-sm">
                        Christmas Shopping
                      </span>
                    </span>
                  </div>
                  <span className="text-gray-700">$1,230</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600">#2</span>
                    <span className="font-medium text-gray-800">
                      July 15{" "}
                      <span className="text-gray-500 text-sm">
                        Home Repairs
                      </span>
                    </span>
                  </div>
                  <span className="text-gray-700">$980</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600">#3</span>
                    <span className="font-medium text-gray-800">
                      March 3{" "}
                      <span className="text-gray-500 text-sm">Car Service</span>
                    </span>
                  </div>
                  <span className="text-gray-700">$850</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600">#4</span>
                    <span className="font-medium text-gray-800">
                      September 28{" "}
                      <span className="text-gray-500 text-sm">Electronics</span>
                    </span>
                  </div>
                  <span className="text-gray-700">$720</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600">#5</span>
                    <span className="font-medium text-gray-800">
                      May 20{" "}
                      <span className="text-gray-500 text-sm">Furniture</span>
                    </span>
                  </div>
                  <span className="text-gray-700">$690</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600">#6</span>
                    <span className="font-medium text-gray-800">
                      August 12{" "}
                      <span className="text-gray-500 text-sm">
                        Travel Booking
                      </span>
                    </span>
                  </div>
                  <span className="text-gray-700">$580</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600">#7</span>
                    <span className="font-medium text-gray-800">
                      November 25{" "}
                      <span className="text-gray-500 text-sm">
                        Black Friday
                      </span>
                    </span>
                  </div>
                  <span className="text-gray-700">$520</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600">#8</span>
                    <span className="font-medium text-gray-800">
                      February 14{" "}
                      <span className="text-gray-500 text-sm">
                        Valentine's Day
                      </span>
                    </span>
                  </div>
                  <span className="text-gray-700">$480</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600">#9</span>
                    <span className="font-medium text-gray-800">
                      June 5{" "}
                      <span className="text-gray-500 text-sm">
                        Home Appliances
                      </span>
                    </span>
                  </div>
                  <span className="text-gray-700">$450</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600">#10</span>
                    <span className="font-medium text-gray-800">New World</span>
                  </div>
                  <span className="text-gray-700">$420</span>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full rounded-md border min-h-4  0 mt- bg-white">
            <h2 className="text-xl font-semibold p-4 border-b">
              Spend Breakdown
            </h2>

            <div className="mt-4 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <div className="p-4 space-y-4">
                  <div className="flex flex-wrap items-center gap-10">
                    {spendCategories.map((category) => {
                      const total = spendCategories.reduce(
                        (sum, cat) => sum + cat.amount,
                        0
                      );
                      const percentage = (
                        (category.amount / total) *
                        100
                      ).toFixed(1);

                      return (
                        <div
                          key={category.category}
                          className="flex items-center gap-2"
                        >
                          <div
                            className={cn("w-5 h-5 rounded", category.color)}
                          />
                          <span className="text-sm text-gray-600">
                            {category.category}
                            <br />${category.amount.toLocaleString()} (
                            {percentage}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="relative h-12 w-full flex rounded-lg overflow-hidden">
                    {spendCategories.map((category, index) => {
                      const total = spendCategories.reduce(
                        (sum, cat) => sum + cat.amount,
                        0
                      );
                      const percentage = (category.amount / total) * 100;

                      // Calculate previous segments total width for positioning label
                      const previousWidth = spendCategories
                        .slice(0, index)
                        .reduce(
                          (sum, cat) => sum + (cat.amount / total) * 100,
                          0
                        );

                      return (
                        <div
                          key={category.category}
                          className={cn(
                            "h-full transition-all relative group",
                            category.color
                          )}
                          style={{ width: `${percentage}%` }}
                        >
                          {/* Tooltip */}
                          <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white px-3 py-2 rounded-md shadow-lg text-sm whitespace-nowrap z-10 border">
                            <div className="font-medium">
                              {category.category}
                            </div>
                            <div className="text-gray-600">
                              ${category.amount.toLocaleString()}
                            </div>
                            <div className="text-gray-500">
                              {percentage.toFixed(1)}% of total
                            </div>
                          </div>

                          {/* Hover effect overlay */}
                          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </ResponsiveContainer>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Powered by Akahu</CardTitle>
              <CardDescription>Open Banking for New Zealand</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Experience secure, reliable access to your financial data
                through Akahu's open banking platform. Learn more about how
                we're making banking better for everyone.
              </p>
              <Button className="mt-4 gap-2" variant="default" asChild>
                <a href="https://akahu.nz" target="_blank">
                  Learn More About Akahu{" "}
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Looking for a software job?</CardTitle>
              <CardDescription>Watchful is hiring!</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Love building useful tools? The company I work for is looking
                for passionate developers to join our team at Watchful.
              </p>

              <Button className="mt-4 gap-2" asChild variant="default">
                <a href="https://watchful.co.nz/careers" target="_blank">
                  View Open Positions
                </a>
              </Button>
            </CardContent>
          </Card>
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
