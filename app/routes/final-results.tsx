import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button, buttonVariants } from "~/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";
import { Share2, Download, RotateCcw } from "lucide-react";
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
import type { TransactionAnalytics } from "../types";

type SpendCategory = {
  category: string;
  amount: number;
  color: string;
};

export default function FinalResultsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const navigate = useNavigate();

  const rawData = localStorage.getItem("results");
  const rawTransactions = rawData
    ? JSON.parse(rawData)
        .raw_transactions.filter((t) => t.direction !== "CREDIT")
        .filter((t) => {
          const date = new Date(t.date);
          return date.getFullYear() === 2024 && date <= new Date('2024-12-31T23:59:59.999Z');
        })
        .filter((t) => t.description !== "Online       Payment -  Thank You")
    : null;

  const analytics = useMemo(() => {
    if (!rawTransactions) return null;

    // Process transactions
    const totalSpent = rawTransactions
      .filter((t) => t.direction === "DEBIT")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Calculate spending by category for the pie chart
    const categorySpending = rawTransactions
      .filter((t) => t.category?.name)
      .reduce((acc, t) => {
        const categoryName = t.category.name;
        if (!acc[categoryName]) {
          acc[categoryName] = 0;
        }
        acc[categoryName] += Math.abs(t.amount);
        return acc;
      }, {});

    // Calculate spending by day to find the biggest day
    const dailySpending = rawTransactions.reduce((acc, t) => {
      const date = t.date.split("T")[0]; // Get just the date part
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);

    const highestSpendingDay = Object.entries(dailySpending || {}).sort(
      ([, a], [, b]) => b - a
    )[0];

    const spendCategories = Object.entries(categorySpending)
      .map(([category, amount], index) => ({
        category,
        amount,
        color: `bg-${
          [
            "blue",
            "green",
            "yellow",
            "red",
            "purple",
            "pink",
            "indigo",
            "gray",
          ][index % 8]
        }-500`,
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      spendCategories,
      totalSpent,
      highestSpendingDay,
    };
  }, [rawTransactions]);

  // Transform monthly spending data for the chart
  const monthlySpendingData = useMemo(() => {
    if (!rawTransactions) return [];

    const monthlyData = rawTransactions.reduce((acc, t) => {
      const date = new Date(t.date);
      const monthKey = new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
      }).format(date);

      if (!acc[monthKey]) {
        acc[monthKey] = 0;
      }
      acc[monthKey] += Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(monthlyData)
      .map(([month, amount]) => ({
        period: month,
        amount,
      }))
      .sort((a, b) => {
        const dateA = new Date(a.period);
        const dateB = new Date(b.period);
        return dateA.getTime() - dateB.getTime();
      });
  }, [rawTransactions]);

  // Transform weekly spending data for the chart
  const weeklySpendingData = useMemo(() => {
    if (!rawTransactions) return [];

    const weeklyData = rawTransactions.reduce((acc, t) => {
      const date = new Date(t.date);
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      const weekKey = `Week of ${new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(startOfWeek)}`;

      if (!acc[weekKey]) {
        acc[weekKey] = 0;
      }
      acc[weekKey] += Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(weeklyData)
      .map(([week, amount]) => ({
        period: week,
        amount,
      }))
      .sort((a, b) => {
        const dateA = new Date(a.period.replace("Week of ", ""));
        const dateB = new Date(b.period.replace("Week of ", ""));
        return dateA.getTime() - dateB.getTime();
      });
  }, [rawTransactions]);

  // Transform daily spending data for the chart
  const dailySpendingData = useMemo(() => {
    if (!rawTransactions) return [];

    const dailyData = rawTransactions.reduce((acc, t) => {
      const date = new Date(t.date);
      const dayKey = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(date);

      if (!acc[dayKey]) {
        acc[dayKey] = 0;
      }
      acc[dayKey] += Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(dailyData)
      .map(([day, amount]) => ({
        period: day,
        amount,
      }))
      .sort((a, b) => {
        const dateA = new Date(a.period);
        const dateB = new Date(b.period);
        return dateA.getTime() - dateB.getTime();
      });
  }, [rawTransactions]);

  const spendingData = {
    monthly: monthlySpendingData,
    weekly: weeklySpendingData,
    daily: dailySpendingData,
  };

  const totalSpent = analytics?.totalSpent || 0;
  const transactionCount = rawTransactions?.length || 0;
  const averageTransaction =
    rawTransactions?.reduce((sum, t) => sum + Math.abs(t.amount), 0) /
      transactionCount || 0;

  return (
    <div className="min-h-screen  p-6 max-md:p-4">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center my-24">
          <h1 className="text-4xl font-bold mb-4">Your 2024 Money Wrapped</h1>
          <p className="text-gray-900 text-lg">
            Thanks for exploring your spending journey from 1 Jan 2024 to 31 Dec 2024!
          </p>
          <div className="mt-6 flex gap-4 justify-center items-center flex-wrap">
          <Link
            className={buttonVariants({
              variant: "outline",
              className: "",
            })}
            to="/results"
          >
            <RotateCcw />
            Replay Journey
          </Link>
          {/* <Button className="max-xl:hidden" variant="outline" onClick={() => navigate('/edit')}>Edit Transactions</Button> */}
          </div>
        </div>

        <div className="grid gap-4">
          <Card className="bg-white border shadow-sm">
            <CardHeader>
              <CardTitle className="">Key Highlights</CardTitle>
              <CardDescription className="">
                Your year in numbers
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
              <div className="p-4 bg-emerald-50 rounded-lg">
                <p className="text-gray-700">Total Spent</p>
                <p className="text-2xl font-bold text-emerald-600">
                  $
                  {totalSpent.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-gray-700">Transactions</p>
                <p className="text-2xl font-bold text-blue-600">
                  {transactionCount}
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-gray-700">Businesses</p>
                <p className="text-2xl font-bold text-purple-600">
                  {new Set(
                    rawTransactions
                      ?.filter((t) => t.merchant?.name)
                      .map((t) => t.merchant.name)
                  ).size || 0}
                </p>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg">
                <p className="text-gray-700">
                  Biggest Day -{" "}
                  {analytics?.highestSpendingDay
                    ? new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                      }).format(new Date(analytics.highestSpendingDay[0]))
                    : "No data"}
                </p>
                <p className="text-2xl font-bold text-pink-600">
                  $
                  {analytics?.highestSpendingDay
                    ? analytics.highestSpendingDay[1].toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )
                    : "0.00"}
                </p>
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

            <div className="mt-4 h-[400px] w-full pl-4">
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
                    tickFormatter={(value) =>
                      `$${value.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    }
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (
                        active &&
                        payload?.[0]?.payload &&
                        payload.length > 0
                      ) {
                        const data = payload[0];
                        return (
                          <div className="rounded-lg border bg-white p-2 shadow-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="font-medium">
                                {data.payload.period}
                              </div>
                              <div className="text-right font-medium">
                                $
                                {data.value?.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
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
          <div className="grid grid-cols-3 gap-4 max-md:flex max-md:flex-col">
            <div className="rounded-xl border p-8 bg-gradient-to-b from-slate-100 to-slate-200 text-gray-800 flex flex-col items-center justify-center">
              <p className="text-lg text-slate-700 mb-2">
                This year you spent
              </p>
              <p className="text-5xl font-bold mb-2">
                $
                {totalSpent.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-lg text-slate-700">on purchases</p>
            </div>

            <div className="col-span-2 rounded-xl  flex flex-col p-8 bg-slate-50 text-gray-800 border max-md:p-4">
              <h3 className="text-2xl font-bold text-slate-700 mb-4 max-md:mb-2">
                Top Merchants
              </h3>
              <div className="">
                {Object.entries(
                  rawTransactions
                    ?.filter((t) => t.merchant?.name)
                    .reduce((acc, t) => {
                      const name = t.merchant.name;
                      if (!acc[name]) {
                        acc[name] = {
                          amount: 0,
                          logo: t.merchant.logo,
                          count: 0,
                        };
                      }
                      acc[name].amount += Math.abs(t.amount);
                      acc[name].count += 1;
                      return acc;
                    }, {} as { [key: string]: { amount: number; logo: string; count: number } })
                )
                  .sort(([, a], [, b]) => b.amount - a.amount)
                  .slice(0, 10)
                  .map(([merchantName, data], index) => (
                    <div
                      className="flex justify-between items-center border-t border-slate-200 pt-3 mt-3"
                      key={merchantName}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600 min-w-8">
                          #{index + 1}
                        </span>
                        {data.logo ? (
                          <img
                            src={data.logo}
                            className="h-8 w-8 rounded shadow-sm object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded shadow-sm bg-gray-200" />
                        )}
                        <div>
                          <span className="font-medium text-gray-800">
                            {merchantName}
                          </span>
                          <p className="text-sm text-gray-500">
                            {data.count} transaction
                            {data.count !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <span className="text-gray-600">
                        $
                        {data.amount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <div className="flex-1 rounded-xl border p-8 bg-gradient-to-b from-gray-100 to-gray-200 text-gray-800 flex flex-col items-center justify-center">
            <p className="text-lg text-gray-700 mb-2">You made</p>
            <p className="text-5xl font-bold mb-2">{transactionCount}</p>
            <p className="text-lg text-gray-700">transactions</p>
          </div>
          <div className="flex gap-4 max-md:flex-col">
            <div className="flex-1  rounded-xl border p-8 bg-gradient-to-b from-orange-100 to-orange-200 text-gray-800 flex flex-col items-center justify-center">
              <p className="text-lg text-orange-700 mb-2 text-center">
                You spend on average about
              </p>
              <p className="text-5xl font-bold mb-2">
                $
                {averageTransaction.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-lg text-orange-700">per transaction</p>
            </div>
            <div className="flex-1  rounded-xl border  p-8 bg-gradient-to-b from-lime-200 to-lime-100 text-white flex flex-col items-center justify-center">
              <p className="text-lg text-lime-700 mb-2">
                You spent the most on
              </p>

              <p className="text-5xl font-bold text-lime-800  mb-2">
                {analytics?.highestSpendingDay
                  ? new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                    }).format(new Date(analytics.highestSpendingDay[0]))
                  : "N/A"}
              </p>
              <p className="text-lg text-lime-700 text-center">
                $
                {analytics?.highestSpendingDay
                  ? analytics.highestSpendingDay[1].toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : "0.00"}
              </p>
            </div>

            <div className="flex-1 rounded-xl border p-8 bg-gradient-to-b from-rose-100 to-rose-200 text-gray-800 flex flex-col items-center justify-center">
              <p className="text-lg text-rose-700 mb-2">You shopped at</p>
              <p className="text-5xl font-bold mb-2">
                {new Set(rawTransactions?.map((t) => t.merchant)).size || 0}
              </p>
              <p className="text-lg text-rose-700">different businesses</p>
            </div>
          </div>
          <div className="grid grid-cols-3 max-md:flex max-md:flex-col gap-4">
            <div className="col-span-2 rounded-xl  flex flex-col p-8 bg-violet-50 text-gray-800 border max-md:order-2 max-md:p-4">
              <h3 className="text-2xl font-bold text-violet-700 mb-6 max-md:mb-2">
                Restaurants &amp; Cafes
              </h3>
              <div className="">
                {Object.entries(
                  rawTransactions
                    ?.filter(
                      (t) =>
                        t.merchant?.name &&
                        t.category?.name === "Cafes and restaurants"
                    )
                    .reduce((acc, t) => {
                      const name = t.merchant.name;
                      if (!acc[name]) {
                        acc[name] = {
                          amount: 0,
                          logo: t.merchant.logo,
                          count: 0,
                        };
                      }
                      acc[name].amount += Math.abs(t.amount);
                      acc[name].count += 1;
                      return acc;
                    }, {} as { [key: string]: { amount: number; logo: string; count: number } })
                )
                  .sort(([, a], [, b]) => b.amount - a.amount)
                  .slice(0, 10)
                  .map(([merchantName, data], index) => (
                    <div
                      className="flex justify-between items-center mt-4 pt-4 border-t border-violet-200"
                      key={merchantName}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-violet-600 min-w-8">
                          #{index + 1}
                        </span>
                        {data.logo ? (
                          <img
                            src={data.logo}
                            className="h-8 w-8 rounded shadow-sm object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded shadow-sm bg-gray-200" />
                        )}
                        <div>
                          <span className="font-medium text-gray-800">
                            {merchantName}
                          </span>
                          <p className="text-sm text-gray-500">
                            {data.count} transaction
                            {data.count !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <span className="text-gray-600">
                        $
                        {data.amount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
            <div className="flex-1 rounded-xl border p-8 bg-gradient-to-b from-violet-100 to-violet-200 text-gray-800 flex flex-col items-center justify-center">
              <p className="text-lg text-violet-700 mb-2">You spent</p>
              <p className="text-5xl font-bold mb-2">
                $
                {rawTransactions
                  ?.filter((t) => t.category?.name === "Cafes and restaurants")
                  .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                  .toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
              </p>
              <p className="text-lg text-violet-700">
                on Restaurants &amp; Cafes
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 max-md:flex max-md:flex-col gap-4">
            <div className="col-span-2 rounded-xl flex flex-col p-8 bg-violet-50 text-gray-800 border max-md:order-3 max-md:p-4">
              <h3 className="text-2xl font-bold text-violet-700 mb-6 max-md:mb-2">
                Bars &amp; Nightclubs
              </h3>
              <div className="">
                {Object.entries(
                  rawTransactions
                    ?.filter(
                      (t) =>
                        t.merchant?.name &&
                        t.category?.name === "Bars, pubs, nightclubs"
                    )
                    .reduce((acc, t) => {
                      const name = t.merchant.name;
                      if (!acc[name]) {
                        acc[name] = {
                          amount: 0,
                          logo: t.merchant.logo,
                          count: 0,
                        };
                      }
                      acc[name].amount += Math.abs(t.amount);
                      acc[name].count += 1;
                      return acc;
                    }, {} as { [key: string]: { amount: number; logo: string; count: number } })
                )
                  .sort(([, a], [, b]) => b.amount - a.amount)
                  .slice(0, 10)
                  .map(([merchantName, data], index) => (
                    <div
                      className="flex justify-between items-center mt-4 pt-4 border-t border-violet-200"
                      key={merchantName}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-violet-600 min-w-8">
                          #{index + 1}
                        </span>
                        {data.logo ? (
                          <img
                            src={data.logo}
                            className="h-8 w-8 rounded shadow-sm object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded shadow-sm bg-gray-200" />
                        )}
                        <div>
                          <span className="font-medium text-gray-800">
                            {merchantName}
                          </span>
                          <p className="text-sm text-gray-500">
                            {data.count} transaction
                            {data.count !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <span className="text-gray-600">
                        $
                        {data.amount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
            <div className="flex-1 rounded-xl border p-8 bg-gradient-to-b from-violet-100 to-violet-200 text-gray-800 flex flex-col items-center justify-center">
              <p className="text-lg text-violet-700 mb-2">You spent</p>
              <p className="text-5xl font-bold mb-2">
                $
                {rawTransactions
                  ?.filter((t) => t.category?.name === "Bars, pubs, nightclubs")
                  .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                  .toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
              </p>
              <p className="text-lg text-violet-700">
                on Bars &amp; Nightclubs
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 max-md:flex max-md:flex-col gap-4">
            <div className="col-span-2 rounded-xl flex flex-col p-8 bg-fuchsia-50 text-gray-800 border max-md:p-4 max-md:order-2">
              <h3 className="text-2xl font-bold text-fuchsia-700 mb-6 max-md:mb-2">
                Fashion 
              </h3>
              <div className="">
                {Object.entries(
                  rawTransactions
                    ?.filter(
                      (t) =>
                        t.merchant?.name &&
                        t.category?.group?.personal_finance?.name ===
                          "Appearance"
                    )
                    .reduce((acc, t) => {
                      const name = t.merchant.name;
                      if (!acc[name]) {
                        acc[name] = {
                          amount: 0,
                          logo: t.merchant.logo,
                          count: 0,
                        };
                      }
                      acc[name].amount += Math.abs(t.amount);
                      acc[name].count += 1;
                      return acc;
                    }, {} as { [key: string]: { amount: number; logo: string; count: number } })
                )
                  .sort(([, a], [, b]) => b.amount - a.amount)
                  .slice(0, 10)
                  .map(([merchantName, data], index) => (
                    <div
                      className="flex justify-between items-center mt-4 pt-4 border-t border-fuchsia-200"
                      key={merchantName}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-fuchsia-600 min-w-8">
                          #{index + 1}
                        </span>
                        {data.logo ? (
                          <img
                            src={data.logo}
                            className="h-8 w-8 rounded shadow-sm object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded shadow-sm bg-gray-200" />
                        )}
                        <div>
                          <span className="font-medium text-gray-800">
                            {merchantName}
                          </span>
                          <p className="text-sm text-gray-500">
                            {data.count} transaction
                            {data.count !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <span className="text-gray-600">
                        $
                        {data.amount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
            <div className="flex-1 rounded-xl border p-8 bg-gradient-to-b from-fuchsia-100 to-fuchsia-200 text-gray-800 flex flex-col items-center justify-center">
              <p className="text-lg text-fuchsia-700 mb-2">You spent</p>
              <p className="text-5xl font-bold mb-2">
                $
                {rawTransactions
                  ?.filter(
                    (t) =>
                      t.category?.group?.personal_finance?.name === "Appearance"
                  )
                  .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                  .toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
              </p>
              <p className="text-lg text-purple-700">on fashion</p>
            </div>
          </div>
          <div className="grid grid-cols-3 max-md:flex max-md:flex-col gap-4">
            <div className="col-span-2 rounded-xl flex flex-col p-8 bg-emerald-50 text-gray-800 border max-md:p-4 max-md:order-2">
              <h3 className="text-2xl font-bold text-emerald-700 mb-6 max-md:mb-2">
                Education 
              </h3>
              <div className="">
                {Object.entries(
                  rawTransactions
                    ?.filter(
                      (t) =>
                        t.merchant?.name &&
                        t.category?.group?.personal_finance?.name ===
                          "Education"
                    )
                    .reduce((acc, t) => {
                      const name = t.merchant.name;
                      if (!acc[name]) {
                        acc[name] = {
                          amount: 0,
                          logo: t.merchant.logo,
                          count: 0,
                        };
                      }
                      acc[name].amount += Math.abs(t.amount);
                      acc[name].count += 1;
                      return acc;
                    }, {} as { [key: string]: { amount: number; logo: string; count: number } })
                )
                  .sort(([, a], [, b]) => b.amount - a.amount)
                  .slice(0, 10)
                  .map(([merchantName, data], index) => (
                    <div
                      className="flex justify-between items-center mt-4 pt-4 border-t border-emerald-200"
                      key={merchantName}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-600 min-w-8">
                          #{index + 1}
                        </span>
                        {data.logo ? (
                          <img
                            src={data.logo}
                            className="h-8 w-8 rounded shadow-sm object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded shadow-sm bg-gray-200" />
                        )}
                        <div>
                          <span className="font-medium text-gray-800">
                            {merchantName}
                          </span>
                          <p className="text-sm text-gray-500">
                            {data.count} transaction
                            {data.count !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <span className="text-gray-600">
                        $
                        {data.amount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
            <div className="flex-1 rounded-xl border p-8 bg-gradient-to-b from-emerald-100 to-emerald-200 text-gray-800 flex flex-col items-center justify-center">
              <p className="text-lg text-emerald-700 mb-2">You spent</p>
              <p className="text-5xl font-bold mb-2">
                $
                {rawTransactions
                  ?.filter(
                    (t) =>
                      t.category?.group?.personal_finance?.name === "Education"
                  )
                  .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                  .toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
              </p>
              <p className="text-lg text-emerald-700">on Education</p>
            </div>
          </div>
          <div className="grid grid-cols-3 max-md:flex max-md:flex-col gap-4">
            <div className="col-span-2 rounded-xl flex flex-col p-8 bg-violet-50 text-gray-800 border max-md:order-3 max-md:p-4">
              <h3 className="text-2xl font-bold text-violet-700 mb-6 max-md:mb-2">
                 Lifestyle 
              </h3>
              <div className="">
                {Object.entries(
                  rawTransactions
                    ?.filter(
                      (t) =>
                        t.merchant?.name &&
                        t.category?.group?.personal_finance?.name ===
                          "Lifestyle"
                    )
                    .reduce((acc, t) => {
                      const name = t.merchant.name;
                      if (!acc[name]) {
                        acc[name] = {
                          amount: 0,
                          logo: t.merchant.logo,
                          count: 0,
                        };
                      }
                      acc[name].amount += Math.abs(t.amount);
                      acc[name].count += 1;
                      return acc;
                    }, {} as { [key: string]: { amount: number; logo: string; count: number } })
                )
                  .sort(([, a], [, b]) => b.amount - a.amount)
                  .slice(0, 10)
                  .map(([merchantName, data], index) => (
                    <div
                      className="flex justify-between items-center mt-4 pt-4 border-t border-violet-200"
                      key={merchantName}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-violet-600 min-w-8">
                          #{index + 1}
                        </span>
                        {data.logo ? (
                          <img
                            src={data.logo}
                            className="h-8 w-8 rounded shadow-sm object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded shadow-sm bg-gray-200" />
                        )}
                        <div>
                          <span className="font-medium text-gray-800">
                            {merchantName}
                          </span>
                          <p className="text-sm text-gray-500">
                            {data.count} transaction
                            {data.count !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <span className="text-gray-600">
                        $
                        {data.amount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
            <div className="flex-1 rounded-xl border p-8 bg-gradient-to-b from-violet-100 to-violet-200 text-gray-800 flex flex-col items-center justify-center">
              <p className="text-lg text-violet-700 mb-2">You spent</p>
              <p className="text-5xl font-bold mb-2">
                $
                {rawTransactions
                  ?.filter(
                    (t) =>
                      t.category?.group?.personal_finance?.name === "Lifestyle"
                  )
                  .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                  .toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
              </p>
              <p className="text-lg text-violet-700">on lifestyle goods and services</p>
            </div>
          </div>
          <div className="flex-1 rounded-xl border p-8 bg-gradient-to-b from-orange-100 to-orange-200 text-gray-800 flex flex-col items-center justify-center">
            <p className="text-lg text-orange-700 mb-2">You spent</p>
            <p className="text-5xl font-bold mb-2">
              $
              {rawTransactions
                ?.filter(
                  (t) =>
                    t.category?.group?.personal_finance?.name === "Transport"
                )
                .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                .toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
            </p>
            <p className="text-lg text-orange-700">on transport costs</p>
          </div>
          <div className="rounded-xl border p-8 bg-orange-50 max-md:p-4 max-md:mb-4">
            <h3 className="text-2xl font-bold text-orange-700 mb-6 max-md:mb-4 max-md:border-b border-orange-200 max-md:pb-4">
              Transport
            </h3>
            <div className="">
              {(() => {
                const merchantTotals = rawTransactions
                  ?.filter(
                    (t) =>
                      t.category?.group?.personal_finance?.name === "Transport"
                  )
                  .reduce((acc, transaction) => {
                    const merchantName =
                      transaction.merchant?.name || transaction.description;
                    if (!acc[merchantName]) {
                      acc[merchantName] = {
                        amount: 0,
                        logo: transaction.merchant?.logo,
                        count: 0,
                      };
                    }
                    acc[merchantName].amount += Math.abs(transaction.amount);
                    acc[merchantName].count += 1;
                    return acc;
                  }, {} as { [key: string]: { amount: number; logo?: string; count: number } });

                return Object.entries(merchantTotals || {})
                  .sort(([, a], [, b]) => b.amount - a.amount)
                  .slice(0, 5)
                  .map(([merchantName, data], index) => (
                    <div
                      className="flex justify-between items-center border-b border-orange-200 pb-3 mb-3"
                      key={merchantName}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-orange-600 min-w-8">
                          #{index + 1}
                        </span>
                        {data.logo ? (
                          <img
                            src={data.logo}
                            className="h-8 w-8 rounded shadow-sm object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded shadow-sm bg-gray-200" />
                        )}
                        <div>
                          <span className="font-medium text-gray-800">
                            {merchantName}
                          </span>
                          <p className="text-sm text-gray-500">
                            {data.count} transaction
                            {data.count !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <span className="text-gray-600">
                        $
                        {data.amount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  ));
              })()}
            </div>
          </div>
          <div className="grid grid-cols-3   max-md:flex max-md:flex-col gap-4">
            <div className="col-span-2 rounded-xl flex flex-col p-8 bg-lime-50 text-gray-800 border max-md:order-2  max-md:p-4">
              <h3 className="text-2xl font-bold text-lime-700 mb-6 max-md:mb-2">
                Household
              </h3>
              <div className="">
                {Object.entries(
                  rawTransactions
                    ?.filter(
                      (t) =>
                        t.merchant?.name &&
                        t.category?.group?.personal_finance?.name ===
                          "Household"
                    )
                    .reduce((acc, t) => {
                      const name = t.merchant.name;
                      if (!acc[name]) {
                        acc[name] = {
                          amount: 0,
                          logo: t.merchant.logo,
                          count: 0,
                        };
                      }
                      acc[name].amount += Math.abs(t.amount);
                      acc[name].count += 1;
                      return acc;
                    }, {} as { [key: string]: { amount: number; logo: string; count: number } })
                )
                  .sort(([, a], [, b]) => b.amount - a.amount)
                  .slice(0, 10)
                  .map(([merchantName, data], index) => (
                    <div
                      className="flex justify-between items-center mt-4 pt-4 border-t border-lime-200"
                      key={merchantName}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lime-600 min-w-8">
                          #{index + 1}
                        </span>
                        {data.logo ? (
                          <img
                            src={data.logo}
                            className="h-8 w-8 rounded shadow-sm object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded shadow-sm bg-gray-200" />
                        )}
                        <div>
                          <span className="font-medium text-gray-800">
                            {merchantName}
                          </span>
                          <p className="text-sm text-gray-500">
                            {data.count} transaction
                            {data.count !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <span className="text-gray-600">
                        $
                        {data.amount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
            <div className="flex-1 rounded-xl border p-8 bg-gradient-to-b from-lime-100 to-lime-200 text-gray-800 flex flex-col items-center justify-center">
              <p className="text-lg text-lime-700 mb-2">You spent</p>
              <p className="text-5xl font-bold mb-2">
                $
                {rawTransactions
                  ?.filter(
                    (t) =>
                      t.category?.group?.personal_finance?.name === "Household"
                  )
                  .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                  .toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
              </p>
              <p className="text-lg text-lime-700">on household goods and services</p>
            </div>
          </div>
          <div className="grid grid-cols-3   max-md:flex max-md:flex-col gap-4">
            <div className="col-span-2 rounded-xl flex flex-col p-8 bg-amber-50 text-gray-800 border max-md:order-2">
              <h3 className="text-2xl font-bold text-amber-700 mb-6">
        Food
              </h3>
              <div className="">
                {Object.entries(
                  rawTransactions
                    ?.filter(
                      (t) =>
                        t.merchant?.name &&
                        t.category?.group?.personal_finance?.name ===
                          "Food"
                    )
                    .reduce((acc, t) => {
                      const name = t.merchant.name;
                      if (!acc[name]) {
                        acc[name] = {
                          amount: 0,
                          logo: t.merchant.logo,
                          count: 0,
                        };
                      }
                      acc[name].amount += Math.abs(t.amount);
                      acc[name].count += 1;
                      return acc;
                    }, {} as { [key: string]: { amount: number; logo: string; count: number } })
                )
                  .sort(([, a], [, b]) => b.amount - a.amount)
                  .slice(0, 10)
                  .map(([merchantName, data], index) => (
                    <div
                      className="flex justify-between items-center mt-4 pt-4 border-t border-amber-200"
                      key={merchantName}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lime-600 min-w-8">
                          #{index + 1}
                        </span>
                        {data.logo ? (
                          <img
                            src={data.logo}
                            className="h-8 w-8 rounded shadow-sm object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded shadow-sm bg-gray-200" />
                        )}
                        <div>
                          <span className="font-medium text-gray-800">
                            {merchantName}
                          </span>
                          <p className="text-sm text-gray-500">
                            {data.count} transaction
                            {data.count !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <span className="text-gray-600">
                        $
                        {data.amount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
            <div className="flex-1 rounded-xl border p-8 bg-gradient-to-b from-amber-100 to-amber-200 text-gray-800 flex flex-col items-center justify-center">
              <p className="text-lg text-amber-700 mb-2">You spent</p>
              <p className="text-5xl font-bold mb-2">
                $
                {rawTransactions
                  ?.filter(
                    (t) =>
                      t.category?.group?.personal_finance?.name === "Food"
                  )
                  .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                  .toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
              </p>
              <p className="text-lg text-amber-700">on food </p>
            </div>
          </div>

          <div className="grid grid-cols-   max-md:flex max-md:flex-col gap-4">
            <div className="rounded-xl flex flex-col p-8 bg-slate-50 text-gray-800 border max-md:p-4">
              <h3 className="text-2xl font-bold text-slate-700 mb-6">
                Largest transactions this year
              </h3>
              <div className="">
                {rawTransactions
                  ?.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
                  .slice(0, 10)
                  .map((transaction, index) => (
                    <div
                      className="flex justify-between items-center border-b border-slate-200 pb-3 mb-3 last:border-0 last:pb-0 last:mb-0"
                      key={index}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-slate-600 min-w-8">
                          #{index + 1}
                        </span>
                        {transaction.merchant?.logo ? (
                          <img
                            src={transaction.merchant.logo}
                            className="h-8 w-8 rounded shadow-sm object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded shadow-sm bg-gray-200" />
                        )}
                        <div>
                          <p className="font-medium text-gray-800">
                            {transaction.merchant?.name ||
                              transaction.description}
                          </p>
                          <p className="text-gray-500">
                            {new Intl.DateTimeFormat("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }).format(new Date(transaction.date))}{" "}
                            - {transaction.category?.name || "Uncategorized"}
                          </p>
                        </div>
                      </div>
                      <span className="text-gray-600 text-right">
                        $
                        {Math.abs(transaction.amount).toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <div className="w-full rounded-md border min-h-4  0 mt- bg-white mb-24">
            <h2 className="text-xl font-semibold p-4 border-b">
              Spend Breakdown
            </h2>

            <div className="mt-4 w-full">
              <div className="p-4 space-y-4">
                <div className="relative w-full">
                  {(() => {
                    const groupTotals =
                      rawTransactions?.reduce((acc, t) => {
                        const groupName =
                          t.category?.group?.personal_finance?.name;
                        if (groupName) {
                          if (!acc[groupName]) {
                            acc[groupName] = 0;
                          }
                          acc[groupName] += Math.abs(t.amount);
                        }
                        return acc;
                      }, {} as { [key: string]: number }) || {};

                    const groups = Object.entries(groupTotals)
                      .map(([name, amount]) => ({
                        name,
                        amount,
                        color:
                          name === "Appearance"
                            ? "bg-fuchsia-500"
                            : name === "Education"
                            ? "bg-emerald-500"
                            : name === "Food"
                            ? "bg-amber-500"
                            : name === "Health"
                            ? "bg-rose-500"
                            : name === "Household"
                            ? "bg-sky-500"
                            : name === "Housing"
                            ? "bg-indigo-500"
                            : name === "Lifestyle"
                            ? "bg-violet-500"
                            : name === "Professional Services"
                            ? "bg-teal-500"
                            : name === "Transport"
                            ? "bg-orange-500"
                            : name === "Utilities"
                            ? "bg-cyan-500"
                            : "bg-slate-500",
                      }))
                      .sort((a, b) => b.amount - a.amount);

                    const total = groups.reduce(
                      (sum, group) => sum + group.amount,
                      0
                    );

                    // Create an array of 100 cells (each representing ~1%)
                    const cells = Array(100).fill(null);
                    let currentGroupIndex = 0;
                    let remainingGroupPercentage = (groups[0]?.amount / total) * 100 || 0;
                    
                    const filledCells = cells.map((_, index) => {
                      if (remainingGroupPercentage <= 0) {
                        currentGroupIndex++;
                        remainingGroupPercentage = (groups[currentGroupIndex]?.amount / total) * 100 || 0;
                      }
                      
                      const currentGroup = groups[currentGroupIndex];
                      if (!currentGroup) return null;
                      
                      remainingGroupPercentage--;
                      
                      return {
                        group: currentGroup,
                        colorClass: currentGroup.color,
                      };
                    });

                    return (
                      <div className="grid grid-rows-[repeat(4,minmax(1rem,1fr))] md:grid-rows-[repeat(4,minmax(2rem,1fr))] gap-[0] grid-flow-col gap-[0.2rem] mx-auto rounded-md overflow-hidden">
                        {filledCells.map((cell, index) => (
                          cell && (
                            <div
                              key={index}
                              className={cn(
                                "aspect-square  transition-all relative group cursor-pointer",
                                cell.colorClass
                              )}
                            >
                              <div className="hidden group-hover:block absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white px-3 py-2 rounded-md shadow-lg text-sm whitespace-nowrap z-10 border">
                                <div className="font-medium">
                                  {cell.group.name}
                                </div>
                                <div className="text-gray-600">
                                  ${cell.group.amount.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </div>
                                <div className="text-gray-500">
                                  {((cell.group.amount / total) * 100).toFixed(1)}% of total
                                </div>
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    );
                  })()}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-6">
                  {(() => {
                    const groupTotals =
                      rawTransactions?.reduce((acc, t) => {
                        const groupName =
                          t.category?.group?.personal_finance?.name;
                        if (groupName) {
                          if (!acc[groupName]) {
                            acc[groupName] = 0;
                          }
                          acc[groupName] += Math.abs(t.amount);
                        }
                        return acc;
                      }, {} as { [key: string]: number }) || {};

                    const groups = Object.entries(groupTotals)
                      .map(([name, amount]) => ({
                        name,
                        amount,
                        color:
                          name === "Appearance"
                            ? "bg-fuchsia-500"
                            : name === "Education"
                            ? "bg-emerald-500"
                            : name === "Food"
                            ? "bg-amber-500"
                            : name === "Health"
                            ? "bg-rose-500"
                            : name === "Household"
                            ? "bg-sky-500"
                            : name === "Housing"
                            ? "bg-indigo-500"
                            : name === "Lifestyle"
                            ? "bg-violet-500"
                            : name === "Professional Services"
                            ? "bg-teal-500"
                            : name === "Transport"
                            ? "bg-orange-500"
                            : name === "Utilities"
                            ? "bg-cyan-500"
                            : "bg-slate-500",
                      }))
                      .sort((a, b) => b.amount - a.amount);

                    const total = groups.reduce(
                      (sum, group) => sum + group.amount,
                      0
                    );

                    return groups.map((group) => {
                      const percentage = (
                        (group.amount / total) *
                        100
                      ).toFixed(1);

                      return (
                        <div
                          key={group.name}
                          className="flex items-center gap-2"
                        >
                          <div
                            className={cn("w-5 h-5 rounded", group.color)}
                          />
                          <span className="text-sm text-gray-600">
                            {group.name}
                            <br />$
                            {group.amount.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{" "}
                            ({percentage}%)
                          </span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
            <Card>
              <CardHeader>
                <CardTitle>Powered by Akahu</CardTitle>
                <CardDescription>Open Banking for New Zealand</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 min-h-20">
                  Experience secure, reliable access to your financial data
                  through Akahu's open finance platform. Learn more about how
                  Akahu makes account connectivity better for everyone.
                </p>
                <Button className="mt-4 gap-2 w-full bg-blue-700 " variant="default" asChild>
                  <a href="https://akahu.nz" target="_blank">
                    Learn More About Akahu{" "}
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Looking for a job?</CardTitle>
                <CardDescription>Watchful is hiring!</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 min-h-20">
                  Do you like useful tools? We're looking for talented people who enjoy designing and building stuff like this at Watchful.
                </p>

                <Button className="mt-4 gap-2  w-full bg-blue-700 " asChild variant="default">
                  <a href="https://watchful.co.nz/careers" target="_blank">
                    Learn about Watchful
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
          <Card className="">
            <CardHeader>
              <CardTitle>Delete Your Data</CardTitle>
              <CardDescription>
                Remove all your financial data from this device. You will have to start over if you want to see this screen again.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to delete all your financial data? This action cannot be undone."
                    )
                  ) {
                    // Clear localStorage
                    localStorage.removeItem("results");
                    localStorage.removeItem("transactions");

                    // Clear all cookies
                    document.cookie.split(";").forEach((cookie) => {
                      document.cookie = cookie
                        .replace(/^ +/, "")
                        .replace(
                          /=.*/,
                          "=;expires=" + new Date().toUTCString() + ";path=/"
                        );
                    });

                    window.location.href = "/";
                  }
                }}
              >
                Delete All Data
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center text-sm text-gray-600">
          <p>
            Money Wrapped 2024 is built by{" "}
            <a className="underline text-blue-700" href="https://walt.online">
              Walter Lim
            </a>{" "}
            ,{" "}
            <a className="underline text-blue-700" href="https://laspruca.nz">
              Connor Hare
            </a>
            , &amp;{" "}
            <a className="underline text-blue-700" href="https://jmw.nz">
              Jasper Miller-Waugh
            </a>
            .
          </p>
          <p className="mt-2">
            All your financial data stays private and secure.
          </p>
        </div>
      </div>
    </div>
  );
}
