import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export function Welcome() {
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

  return (
    <>
      <main className="flex items-center justify-center pt-16 pb-4 ">
        <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
          <section className="w-full max-w-[80rem] mx-auto">
            <div className=" ">
              <div className=" flex items-center gap-3">
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg w-16 h-16"></div>
                <div>
                  <h1 className="text-4xl font-semibold">Money Wrapped</h1>
                  <p className="text-sm text-gray-500">Powered by Akahu</p>
                </div>
              </div>
              <p className="text-2xl mt-8">
                Understand how you spent your money in 2024. There are two ways
                to do this:
              </p>
            </div>
            <div className="mt-8">
              <div className="flex gap-4">
                <Link
                  to="/"
                  className="flex-1 rounded-lg border border-gray-300 p-4 bg-white hover:border-blue-500"
                >
                  <h3 className="text-2xl font-bold underline text-blue-700 mb-2">
                    Sign up to Akahu
                  </h3>
                  <p className=" text-gray-700 mb-4">
                    Use Akahu to get your spending data reviewed faster. We
                    don't store your data after you leave the site and you can
                    verify this at the repo link below - the code is fully open
                    source.
                  </p>
                  <Button>Sign up</Button>
                </Link>
                <Link
                  to="/prepare"
                  className="flex-1 rounded-lg border border-gray-300 p-4 bg-white"
                >
                  <h3 className="text-2xl font-bold underline text-blue-700 mb-2 ">
                    Upload a CSV
                  </h3>
                  <p className=" text-gray-700 mb-4">
                    Dont trust the website? That's okay - Upload a CSV and it
                    can still process your spending for the year. We don't store
                    your data and you can verify this at the repo below - the
                    code is fully open source.
                  </p>
                  <Button>Upload CSV</Button>
                </Link>
              </div>
              <h2 className="mt-12 text-2xl font-semibold">
                Example Demo - Walt's year in review
              </h2>
              <p className="text-2xl mt-2 mb-4">In 2024, you...</p>

              <div className="flex gap-4">
                <div className="flex-1 rounded-lg border border-gray-300 p-4 bg-white">
                  <p className="text-xl font-semibold">Spent $12,300</p>
                </div>

                <div className="flex-1 rounded-lg border border-gray-300 p-4 bg-white">
                  <p className="text-xl font-semibold">
                    Across 301 different businesses
                  </p>
                </div>
                <div className="flex-1 rounded-lg border border-gray-300 p-4 bg-white">
                  <p className="text-xl font-semibold">
                    over 1,230 Transactions
                  </p>
                </div>
              </div>

              <div className="w-full rounded-md border min-h-40 mt-8 bg-white">
                <div className="flex justify-between items-center p-4 border-b">
                  <h2 className="text-xl font-semibold">Spending Breakdown</h2>
                  <Select
                    value={selectedPeriod}
                    onValueChange={setSelectedPeriod}
                  >
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
                      data={
                        spendingData[
                          selectedPeriod as keyof typeof spendingData
                        ]
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
              <div className="w-full rounded-md border min-h-40 mt-8 bg-white">
                <h2 className="text-xl font-semibold p-4 border-b">
                  Top Categories
                </h2>
                by month / day / we
                <div className="mt-4 h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { category: "Groceries", amount: 3000 },
                        { category: "Rent", amount: 6000 },
                        { category: "Utilities", amount: 1200 },
                        { category: "Entertainment", amount: 1500 },
                        { category: "Dining Out", amount: 1600 },
                      ]}
                      layout="vertical"
                    >
                      <XAxis
                        type="number"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <YAxis
                        type="category"
                        dataKey="category"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="rounded-lg border bg-white p-2 shadow-sm">
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="font-medium">
                                    {payload[0].payload.category}
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
                        radius={[0, 4, 4, 0]}
                        className="fill-emerald-500 hover:fill-emerald-600"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="w-full rounded-md border min-h-40 mt-8 bg-white">
                <h2 className="text-xl font-semibold p-4 border-b">
                  Top Merchants
                </h2>

                <div className="mt-4 h-[400px] w-full px-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { merchant: "Supermarket A", amount: 2000 },
                        { merchant: "Landlord", amount: 6000 },
                        { merchant: "Utility Company", amount: 1200 },
                        { merchant: "Restaurant B", amount: 800 },
                        { merchant: "Movie Theater", amount: 700 },
                      ]}
                      layout="vertical"
                      margin={{ left: 120, right: 20, top: 20, bottom: 20 }}
                    >
                      <XAxis
                        type="number"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <YAxis
                        type="category"
                        dataKey="merchant"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        width={100}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="rounded-lg border bg-white p-2 shadow-sm">
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="font-medium">
                                    {payload[0].payload.merchant}
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
                        radius={[0, 4, 4, 0]}
                        className="fill-emerald-500 hover:fill-emerald-600"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <footer className="flex flex-col items-center gap-4 p-4">
        <a href="github">Github Repo</a>{" "}
        <p>
          {" "}
          Want to do stuff with banking data? Visit{" "}
          <a href="https://akahu.nz">Akahu.nz</a>
        </p>
        {/* <p>
          Made by Walter Lim, Jasper Miller-Waugh, Young-Ju Lee and the Akahu
          Team
        </p> */}
      </footer>
    </>
  );
}
