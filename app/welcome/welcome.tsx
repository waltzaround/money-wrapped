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
                    Connect your bank accounts with Akahu
                  </h3>
                  <p className=" text-gray-700 mb-4">
                    Use Akahu to get your spending data reviewed faster. We
                    don't store your data after you leave the site and you can
                    verify this at the repo link below - the code is fully open
                    source.
                  </p>
                  <Button>Connect Accounts</Button>
                </Link>
                <Link
                  to="/csv"
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
              <h2 className="mt-12 text-2xl font-semibold mb-8">
                Example Demo - Walt's year in review
              </h2>

              <div className="flex gap-4">
                <div className="flex-1 aspect-[9/16] rounded-xl border border-gray-300 p-8 bg-gradient-to-b from-emerald-500 to-emerald-700 text-white flex flex-col items-center justify-center">
                  <p className="text-lg text-emerald-100 mb-2">
                    This year you spent
                  </p>
                  <p className="text-5xl font-bold mb-2">$12,300</p>
                  <p className="text-lg text-emerald-100">on purchases</p>
                </div>

                <div className="flex-1 aspect-[9/16] rounded-xl border border-gray-300 p-8 bg-gradient-to-b from-blue-500 to-blue-700 text-white flex flex-col items-center justify-center">
                  <p className="text-lg text-blue-100 mb-2">You shopped at</p>
                  <p className="text-5xl font-bold mb-2">301</p>
                  <p className="text-lg text-blue-100">different businesses</p>
                </div>

                <div className="flex-1 aspect-[9/16] rounded-xl border border-gray-300 p-8 bg-gradient-to-b from-purple-500 to-purple-700 text-white flex flex-col items-center justify-center">
                  <p className="text-lg text-purple-100 mb-2">You made</p>
                  <p className="text-5xl font-bold mb-2">1,230</p>
                  <p className="text-lg text-purple-100">transactions</p>
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
              <div className="flex gap-4 mt-8">
                <div className="flex-1 aspect-[9/16] rounded-xl border border-gray-300 p-8 bg-gradient-to-b from-pink-500 to-pink-700 text-white flex flex-col items-center justify-center">
                  <p className="text-lg text-pink-100 mb-4">
                    Your biggest spending day was
                  </p>
                  <p className="text-4xl font-bold mb-2">December 24</p>
                  <p className="text-6xl font-bold mb-2">$432</p>
                  <p className="text-lg text-pink-100 text-center">
                    That's more than 87% of your daily spending
                  </p>
                </div>

                <div className="flex-1 aspect-[9/16] rounded-xl border border-gray-300 p-8 bg-gradient-to-b from-orange-500 to-orange-700 text-white flex flex-col">
                  <p className="text-lg text-orange-100 mb-4 text-center">
                    Your top 5 most places
                  </p>
                  <div className="flex-1 flex flex-col justify-center gap-4">
                    <div className="flex items-center gap-4">
                      <span className="text-4xl font-bold">1</span>
                      <div>
                        <p className="text-xl font-semibold">Countdown</p>
                        <p className="text-orange-100">42 transactions</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-3xl font-bold">2</span>
                      <div>
                        <p className="text-lg font-semibold">BP Connect</p>
                        <p className="text-orange-100">28 transactions</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold">3</span>
                      <div>
                        <p className="text-lg font-semibold">Starbucks</p>
                        <p className="text-orange-100">24 transactions</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-bold">4</span>
                      <div>
                        <p className="text-lg font-semibold">McDonald's</p>
                        <p className="text-orange-100">19 transactions</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-bold">5</span>
                      <div>
                        <p className="text-lg font-semibold">Bunnings</p>
                        <p className="text-orange-100">15 transactions</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 aspect-[9/16] rounded-xl border border-gray-300 p-8 bg-gradient-to-b from-lime-500 to-lime-700 text-white flex flex-col items-center justify-center">
                  <p className="text-lg text-pink-100 mb-4">
                    Your biggest purchase was:
                  </p>
                  <p className="text-4xl font-bold mb-2">McDonalds</p>
                  <p className="text-6xl font-bold mb-2">$12,432</p>
                  <p className="text-lg text-pink-100 text-center">
                    That's more than 87% of your average purchase
                  </p>
                </div>
              </div>
              <div className="w-full rounded-md border min-h-4  0 mt-8 bg-white">
                <h2 className="text-xl font-semibold p-4 border-b">
                  Top Categories
                </h2>

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
                      margin={{ left: 32, right: 20, top: 20, bottom: 20 }}
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
              <div className="flex gap-4 mt-8">
                <div className="flex-1 aspect-[9/16] rounded-xl border border-gray-300 p-8 bg-gradient-to-b from-pink-500 to-pink-700 text-white flex flex-col items-center justify-center">
                  <p className="text-lg text-pink-100 mb-4">
                    You spend on average about
                  </p>

                  <p className="text-6xl font-bold mb-2">$110</p>
                  <p className="text-4xl font-bold mb-2">every weekend</p>
                  <p className="text-lg text-pink-100 text-center">
                    That's more than 87% of your daily spending
                  </p>
                </div>

                <div className="flex-1 aspect-[9/16] rounded-xl border border-gray-300 p-8 bg-gradient-to-b from-orange-500 to-orange-700 text-white flex flex-col">
                  <p className="text-lg text-orange-100 mb-4 text-center">
                    Your Top 5 Restaurants
                  </p>
                  <div className="flex-1 flex flex-col justify-center gap-4">
                    <div className="flex items-center gap-4">
                      <span className="text-4xl font-bold">1</span>
                      <div>
                        <p className="text-xl font-semibold">McDonald's</p>
                        <p className="text-orange-100">$1,230 spent</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-3xl font-bold">2</span>
                      <div>
                        <p className="text-lg font-semibold">Domino's Pizza</p>
                        <p className="text-orange-100">$890 spent</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold">3</span>
                      <div>
                        <p className="text-lg font-semibold">Burger Fuel</p>
                        <p className="text-orange-100">$750 spent</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-bold">4</span>
                      <div>
                        <p className="text-lg font-semibold">Hell Pizza</p>
                        <p className="text-orange-100">$680 spent</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-bold">5</span>
                      <div>
                        <p className="text-lg font-semibold">Subway</p>
                        <p className="text-orange-100">$520 spent</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 aspect-[9/16] rounded-xl border border-gray-300 p-8 bg-gradient-to-b from-lime-500 to-lime-700 text-white flex flex-col items-center justify-center">
                  <p className="text-lg text-pink-100 mb-4">
                    You visited a cafe
                  </p>

                  <p className="text-6xl font-bold mb-2">110 times</p>
                  <p className="text-lg text-pink-100 text-center">This year</p>
                </div>
              </div>
              <div className="w-full rounded-md border min-h-40 mt-8 bg-white">
                <h2 className="text-xl font-semibold p-4 border-b">
                  Top Merchants
                </h2>

                <div className="mt-4 h-[400px] w-full ">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { merchant: "Landlord", amount: 6000 },
                        { merchant: "Supermarket A", amount: 2000 },
                        { merchant: "Utility Company", amount: 1200 },
                        { merchant: "Restaurant B", amount: 800 },
                        { merchant: "Movie Theater", amount: 700 },
                      ]}
                      layout="vertical"
                      margin={{ left: 0, right: 20, top: 20, bottom: 20 }}
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
