import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router";
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
          return date.getFullYear() === 2024;
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
      const date = new Date(t.date);
      const dayKey = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);

      if (!acc[dayKey]) {
        acc[dayKey] = 0;
      }
      acc[dayKey] += Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);

    const biggestDay = Object.entries(dailySpending).reduce(
      (max, [date, amount]) =>
        !max || amount > max.amount ? { date, amount } : max,
      null as { date: string; amount: number } | null
    );

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
      biggestDay,
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
    <div className="min-h-screen  p-6">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center my-24">
          <h1 className="text-4xl font-bold mb-4">Your 2024 Money Wrapped</h1>
          <p className="text-gray-900 text-lg">
            Thanks for exploring your spending journey!
          </p>
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
                  Biggest Day - {analytics?.biggestDay?.date || "No data"}
                </p>
                <p className="text-2xl font-bold text-pink-600">
                  $
                  {analytics?.biggestDay?.amount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }) || "0.00"}
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
          <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
            <div className="aspect-[9/16] rounded-xl border p-8 bg-gradient-to-b from-emerald-100 to-emerald-200 text-gray-800 flex flex-col items-center justify-center">
              <p className="text-lg text-emerald-700 mb-2">
                This year you spent
              </p>
              <p className="text-5xl font-bold mb-2">
                $
                {totalSpent.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-lg text-emerald-700">on purchases</p>
            </div>

            <div className="col-span-2 rounded-xl  flex flex-col p-8 bg-emerald-50 text-gray-800 border">
              <h3 className="text-2xl font-bold text-emerald-700 mb-4">
                Your Top 10 Merchants
              </h3>
              <div className="">
                {Object.entries(
                  rawTransactions
                    ?.filter((t) => t.merchant?.name)
                    .reduce((acc, t) => {
                      const name = t.merchant.name;
                      if (!acc[name]) {
                        acc[name] = 0;
                      }
                      acc[name] += Math.abs(t.amount);
                      return acc;
                    }, {} as { [key: string]: number })
                )
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 10)
                  .map(([merchantName, totalAmount], index) => (
                    <div
                      className="flex justify-between items-center border-t border-emerald-200 pt-3 mt-3"
                      key={merchantName}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-600">#{index + 1}</span>
                        <span className="font-medium text-gray-800">
                          {merchantName}
                        </span>
                      </div>
                      <span className="text-gray-700">
                        $
                        {totalAmount.toLocaleString(undefined, {
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
            <div className="flex-1 aspect-[9/16] rounded-xl border p-8 bg-gradient-to-b from-orange-100 to-orange-200 text-gray-800 flex flex-col items-center justify-center">
              <p className="text-lg text-orange-700 mb-2">
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
            <div className="flex-1 aspect-[9/16] rounded-xl border  p-8 bg-gradient-to-b from-lime-200 to-lime-100 text-white flex flex-col items-center justify-center">
              <p className="text-lg text-lime-700 mb-2">
                You spent the most on
              </p>

              <p className="text-5xl font-bold text-lime-800  mb-2">
                24 Jan 2024
              </p>
              <p className="text-lg text-lime-700 text-center">$XX,XXX</p>
            </div>

            <div className="flex-1 aspect-[9/16] rounded-xl border p-8 bg-gradient-to-b from-rose-100 to-rose-200 text-gray-800 flex flex-col items-center justify-center">
              <p className="text-lg text-rose-700 mb-2">You shopped at</p>
              <p className="text-5xl font-bold mb-2">
                {new Set(rawTransactions?.map((t) => t.merchant)).size || 0}
              </p>
              <p className="text-lg text-rose-700">different businesses</p>
            </div>
          </div>
          <div className="grid grid-cols-3 max-md:grid-cols-1 gap-4">
            <div className="col-span-2 rounded-xl  flex flex-col p-8 bg-blue-50 text-gray-800 border">
              <h3 className="text-2xl font-bold text-blue-700 mb-2">
                Your Top 10 Restaurants &amp; Cafes
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
                        acc[name] = 0;
                      }
                      acc[name] += Math.abs(t.amount);
                      return acc;
                    }, {} as { [key: string]: number })
                )
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 10)
                  .map(([merchantName, totalAmount], index) => (
                    <div
                      className="flex justify-between items-center mt-4 pt-4 border-t border-blue-200"
                      key={merchantName}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600">#{index + 1}</span>
                        <span className="font-medium text-gray-800">
                          {merchantName}
                        </span>
                      </div>
                      <span className="text-gray-700">
                        $
                        {totalAmount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
            <div className="flex-1 aspect-[9/16] rounded-xl border p-8 bg-gradient-to-b from-blue-100 to-blue-200 text-gray-800 flex flex-col items-center justify-center">
              <p className="text-lg text-blue-700 mb-2">You spent</p>
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
              <p className="text-lg text-blue-700">
                on Restaurants &amp; Cafes
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 max-md:grid-cols-1 gap-4">
            <div className="col-span-2 rounded-xl flex flex-col p-8 bg-violet-50 text-gray-800 border">
              <h3 className="text-2xl font-bold text-violet-700 mb-2">
                Your Top 10 Bars &amp; Nightclubs
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
                        acc[name] = 0;
                      }
                      acc[name] += Math.abs(t.amount);
                      return acc;
                    }, {} as { [key: string]: number })
                )
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 10)
                  .map(([merchantName, totalAmount], index) => (
                    <div
                      className="flex justify-between items-center mt-4 pt-4 border-t border-violet-200"
                      key={merchantName}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-violet-600">#{index + 1}</span>
                        <span className="font-medium text-gray-800">
                          {merchantName}
                        </span>
                      </div>
                      <span className="text-gray-700">
                        $
                        {totalAmount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
            <div className="flex-1 aspect-[9/16] rounded-xl border p-8 bg-gradient-to-b from-violet-100 to-violet-200 text-gray-800 flex flex-col items-center justify-center">
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
          <div className="grid grid-cols-3  max-md:grid-cols-1 gap-4">
            <div className="col-span-2 rounded-xl flex flex-col p-8 bg-purple-50 text-gray-800 border">
              <h3 className="text-2xl font-bold text-purple-700 mb-6">
                Your Top 10 Fashion Purchases
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
                        acc[name] = 0;
                      }
                      acc[name] += Math.abs(t.amount);
                      return acc;
                    }, {} as { [key: string]: number })
                )
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 10)
                  .map(([merchantName, totalAmount], index) => (
                    <div
                      className="flex justify-between items-center mt-4 pt-4 border-t border-purple-200"
                      key={merchantName}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-purple-600">#{index + 1}</span>
                        <span className="font-medium text-gray-800">
                          {merchantName}
                        </span>
                      </div>
                      <span className="text-gray-700">
                        $
                        {totalAmount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
            <div className="flex-1 aspect-[9/16] rounded-xl border p-8 bg-gradient-to-b from-purple-100 to-purple-200 text-gray-800 flex flex-col items-center justify-center">
              <p className="text-lg text-purple-700 mb-2">You spent</p>
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
          <div className="grid grid-cols-3  max-md:grid-cols-1 gap-4">
            <div className="col-span-2 rounded-xl flex flex-col p-8 bg-cyan-50 text-gray-800 border">
              <h3 className="text-2xl font-bold text-cyan-700 mb-6">
                Your Top 10 Lifestyle Purchases
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
                        acc[name] = 0;
                      }
                      acc[name] += Math.abs(t.amount);
                      return acc;
                    }, {} as { [key: string]: number })
                )
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 10)
                  .map(([merchantName, totalAmount], index) => (
                    <div
                      className="flex justify-between items-center mt-4 pt-4 border-t border-cyan-200"
                      key={merchantName}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-600">#{index + 1}</span>
                        <span className="font-medium text-gray-800">
                          {merchantName}
                        </span>
                      </div>
                      <span className="text-gray-700">
                        $
                        {totalAmount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
            <div className="flex-1 aspect-[9/16] rounded-xl border p-8 bg-gradient-to-b from-cyan-100 to-cyan-200 text-gray-800 flex flex-col items-center justify-center">
              <p className="text-lg text-cyan-700 mb-2">You spent</p>
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
              <p className="text-lg text-cyan-700">on lifestyle</p>
            </div>
          </div>
          <div className="grid grid-cols-3  max-md:grid-cols-1 gap-4">
            <div className="col-span-2 rounded-xl flex flex-col p-8 bg-lime-50 text-gray-800 border">
              <h3 className="text-2xl font-bold text-lime-700 mb-6">
                Your Top 10 Household Purchases
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
                        acc[name] = 0;
                      }
                      acc[name] += Math.abs(t.amount);
                      return acc;
                    }, {} as { [key: string]: number })
                )
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 10)
                  .map(([merchantName, totalAmount], index) => (
                    <div
                      className="flex justify-between items-center mt-4 pt-4 border-t border-lime-200"
                      key={merchantName}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lime-600">#{index + 1}</span>
                        <span className="font-medium text-gray-800">
                          {merchantName}
                        </span>
                      </div>
                      <span className="text-gray-700">
                        $
                        {totalAmount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
            <div className="flex-1 aspect-[9/16] rounded-xl border p-8 bg-gradient-to-b from-lime-100 to-lime-200 text-gray-800 flex flex-col items-center justify-center">
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
              <p className="text-lg text-lime-700">on household</p>
            </div>
          </div>

          <div className="grid grid-cols-  max-md:grid-cols-1 gap-4">
            <div className=" rounded-xl  flex flex-col p-8 bg-slate-50 text-gray-800 border">
              <h3 className="text-2xl font-bold text-slate-700 mb-6">
                Largest transactions this year
              </h3>
              <div className="">
                {rawTransactions
                  ?.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
                  .slice(0, 10)
                  .map((transaction, index) => (
                    <div
                      className="flex justify-between items-center border-b border-slate-200 pb-3 mb-3"
                      key={index}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-slate-600">#{index + 1}</span>
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
                      <span className="text-gray-700 text-right">
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
          <div className="w-full rounded-md border min-h-4  0 mt- bg-white">
            <h2 className="text-xl font-semibold p-4 border-b">
              Spend Breakdown
            </h2>

            <div className="mt-4 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <div className="p-4 space-y-4">
                  <div className="relative h-12 w-full flex rounded-lg overflow-hidden">
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

                      return (
                        <>
                          {groups.map((group, index) => {
                            const percentage = (group.amount / total) * 100;
                            const previousWidth = groups
                              .slice(0, index)
                              .reduce(
                                (sum, g) => sum + (g.amount / total) * 100,
                                0
                              );

                            return (
                              <div
                                key={group.name}
                                className={cn(
                                  "h-full transition-all relative group",
                                  group.color
                                )}
                                style={{ width: `${percentage}%` }}
                              >
                                {/* Tooltip */}
                                <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white px-3 py-2 rounded-md shadow-lg text-sm whitespace-nowrap z-10 border">
                                  <div className="font-medium">
                                    {group.name}
                                  </div>
                                  <div className="text-gray-600">
                                    $
                                    {group.amount.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
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
                        </>
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
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
            <Card>
              <CardHeader>
                <CardTitle>Powered by Akahu</CardTitle>
                <CardDescription>Open Banking for New Zealand</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Experience secure, reliable access to your financial data
                  through Akahu's open finance platform. Learn more about how
                  Akahu makes account connectivity better for everyone.
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
                  for developers who like building useful tools.
                </p>

                <Button className="mt-4 gap-2" asChild variant="default">
                  <a href="https://watchful.co.nz/careers" target="_blank">
                    View Open Positions
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-gray-600">
          <p>
            Money Wrapped 2024 is built by{" "}
            <a className="underline text-blue-700" href="https://walt.online">
              Walter Lim
            </a>{" "}
            &amp;{" "}
            <a className="underline text-blue-700" href="https://laspruca.nz">
              Connor Hare
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
