import React from "react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
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
  const location = useLocation();
  const analytics = location.state?.analytics as TransactionAnalytics;

  // Redirect to upload if no analytics
  React.useEffect(() => {
    if (!analytics) {
      navigate("/csv");
    }
  }, [analytics, navigate]);

  // Transform monthly spending data for the chart
  const monthlySpendingData = React.useMemo(() => {
    if (!analytics?.monthlySpendingArray) return [];
    
    return analytics.monthlySpendingArray
      .map(month => {
        const [year, monthNum] = month.month.split('-').map(Number);
        return {
          period: month.monthName.substring(0, 3),
          amount: month.total,
          sortOrder: year * 12 + monthNum // Use this for sorting
        };
      })
      .sort((a, b) => a.sortOrder - b.sortOrder) // Sort chronologically
      .map(({ period, amount }) => ({ period, amount })); // Remove the sortOrder field
  }, [analytics]);

  // Transform weekly spending data for the chart
  const weeklySpendingData = React.useMemo(() => {
    if (!analytics?.earliestTransaction || !analytics?.latestTransaction) return [];
    
    // Convert dates to Date objects
    const startDate = new Date(analytics.earliestTransaction.date.split('/').reverse().join('-'));
    const endDate = new Date(analytics.latestTransaction.date.split('/').reverse().join('-'));
    
    // Initialize all weeks with zero
    const weeklyData: { [key: string]: number } = {};
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const weekNumber = Math.ceil((currentDate.getDate() + currentDate.getDay()) / 7);
      const weekKey = `Week ${weekNumber}`;
      weeklyData[weekKey] = 0;
      currentDate.setDate(currentDate.getDate() + 7);
    }

    // Add transaction amounts to the corresponding weeks
    analytics.largestTransactions.forEach(transaction => {
      const date = new Date(transaction.date.split('/').reverse().join('-'));
      const weekNumber = Math.ceil((date.getDate() + date.getDay()) / 7);
      const weekKey = `Week ${weekNumber}`;
      weeklyData[weekKey] = (weeklyData[weekKey] || 0) + transaction.amount;
    });

    return Object.entries(weeklyData)
      .map(([period, amount]) => ({ period, amount }))
      .sort((a, b) => parseInt(a.period.split(' ')[1]) - parseInt(b.period.split(' ')[1]));
  }, [analytics]);

  // Transform daily spending data for the chart
  const dailySpendingData = React.useMemo(() => {
    if (!analytics?.earliestTransaction || !analytics?.latestTransaction || !analytics?.allTransactions) return [];
    
    // Parse dates correctly
    const [startDay, startMonth, startYear] = analytics.earliestTransaction.date.split('/').map(Number);
    const [endDay, endMonth, endYear] = analytics.latestTransaction.date.split('/').map(Number);
    
    const startDate = new Date(startYear, startMonth - 1, startDay);
    const endDate = new Date(endYear, endMonth - 1, endDay);
    
    // Initialize all days with zero
    const dailyData: { [key: string]: number } = {};
    const currentDate = new Date(startDate);
    
    // Initialize all days between start and end
    while (currentDate <= endDate) {
      const dayKey = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dailyData[dayKey] = 0;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Group transactions by day
    analytics.allTransactions.forEach((transaction: { date: { split: (arg0: string) => { (): any; new(): any; map: { (arg0: NumberConstructor): [any, any, any]; new(): any; }; }; }; amount: number; }) => {
      const [day, month, year] = transaction.date.split('/').map(Number);
      const date = new Date(year, month - 1, day);
      const dayKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      // Only add positive transactions (spending)
      if (transaction.amount > 0) {
        dailyData[dayKey] = (dailyData[dayKey] || 0) + transaction.amount;
      }
    });

    // Convert to array and sort chronologically
    return Object.entries(dailyData)
      .map(([period, amount]) => ({
        period,
        amount: Math.round(amount * 100) / 100
      }))
      .sort((a, b) => {
        const [monthA, dayA] = a.period.split(' ');
        const [monthB, dayB] = b.period.split(' ');
        const dateA = new Date(2023, new Date(monthA + ' 1, 2023').getMonth(), parseInt(dayA));
        const dateB = new Date(2023, new Date(monthB + ' 1, 2023').getMonth(), parseInt(dayB));
        return dateA.getTime() - dateB.getTime();
      });
  }, [analytics]);

  // Transform merchant data for categories
  const topCategories = React.useMemo(() => {
    if (!analytics?.topMerchants) return [];
    
    const colors = [
      "rgb(99, 102, 241)", // indigo-500
      "rgb(168, 85, 247)", // purple-500
      "rgb(236, 72, 153)", // pink-500
      "rgb(249, 115, 22)", // orange-500
      "rgb(234, 179, 8)",  // yellow-500
    ];

    return analytics.topMerchants.map((merchant, index) => ({
      category: merchant.name,
      amount: merchant.total,
      color: colors[index % colors.length]
    }));
  }, [analytics]);

  const spendingData = {
    monthly: monthlySpendingData,
    weekly: weeklySpendingData,
    daily: dailySpendingData
  };

  const totalSpent = analytics?.totalSpent || 0;
  const transactionCount = analytics?.transactionCount || 0;
  const averageTransaction = analytics?.averageTransactionAmount || 0;
  const topMerchant = analytics?.topMerchants?.[0]?.name || "Unknown";
  const topMerchantSpend = analytics?.topMerchants?.[0]?.total || 0;

  const spendCategories: SpendCategory[] = [
    { category: "Rent", amount: 6000, color: "bg-blue-500" },
    { category: "Food", amount: 3000, color: "bg-emerald-500" },
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
                  ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-gray-700">Transactions</p>
                <p className="text-2xl font-bold text-blue-600">{transactionCount}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-gray-700">Businesses</p>
                <p className="text-2xl font-bold text-purple-600">{analytics?.uniqueMerchants || 0}</p>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg">
                <p className="text-gray-700">Biggest Day -             {analytics?.biggestSpendingDay?.date || 'No data'}</p>
                <p className="text-2xl font-bold text-pink-600">
                  {analytics?.biggestSpendingDay ? 
                    new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(analytics.biggestSpendingDay.total)
                    : '$0'}
                </p>
                <p className="text-sm text-gray-600">
      
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
                    tickFormatter={(value) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}

                   
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload?.[0]?.payload && payload.length > 0) {
                        const data = payload[0];
                        return (
                          <div className="rounded-lg border bg-white p-2 shadow-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="font-medium">
                                {data.payload.period}
                              </div>
                              <div className="text-right font-medium">
                                ${data.value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
              <p className="text-5xl font-bold mb-2 text-emerald-800">
                ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-lg text-emerald-700">on purchases</p>
            </div>

            <div className="col-span-2 rounded-xl  flex flex-col p-8 bg-emerald-50 text-gray-800 border">
              <h3 className="text-2xl font-bold text-emerald-700 mb-4">
                Your Top 10 Merchants
              </h3>
              <div className="">
                {analytics?.topMerchants?.slice(0, 10).map((merchant, index) => (
                  <div className="flex justify-between items-center border-t border-green-200 pt-3 mt-3" key={index}>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-600">#{index + 1}</span>
                      <span className="font-medium text-gray-800">{merchant.name}</span>
                    </div>
                    <span className="text-gray-700">${merchant.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
              <p className="text-5xl font-bold mb-2">${averageTransaction.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="text-lg text-orange-700">per transaction</p>
            </div>
            <div className="flex-1 aspect-[9/16] rounded-xl border  p-8 bg-gradient-to-b from-lime-200 to-lime-100 text-white flex flex-col items-center justify-center">
              <p className="text-lg text-lime-700 mb-2">You spent the most on</p>

              <p className="text-5xl font-bold text-lime-800  mb-2">
           24 Jan 2024
              </p>
              <p className="text-lg text-lime-700 text-center">$XX,XXX</p>
            </div>
          
            <div className="flex-1 aspect-[9/16] rounded-xl border p-8 bg-gradient-to-b from-rose-100 to-rose-200 text-gray-800 flex flex-col items-center justify-center">
              <p className="text-lg text-rose-700 mb-2">You shopped at</p>
              <p className="text-5xl font-bold mb-2">{analytics?.uniqueMerchants || 0}</p>
              <p className="text-lg text-rose-700">different businesses</p>
            </div>
          </div>
          <div className="grid grid-cols-3 max-md:grid-cols-1 gap-4">
            <div className="col-span-2 rounded-xl  flex flex-col p-8 bg-blue-50 text-gray-800 border">
              <h3 className="text-2xl font-bold text-blue-700 mb-2">
                Your Top 10 Restaurants &amp; Cafes
              </h3>
              <div className="">
                {analytics?.topMerchants?.slice(0, 10).map((merchant, index) => (
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-blue-200" key={index}>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600">#{index + 1}</span>
                      <span className="font-medium text-gray-800">{merchant.name}</span>
                    </div>
                    <span className="text-gray-700">${merchant.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 aspect-[9/16] rounded-xl border p-8 bg-gradient-to-b from-blue-100 to-blue-200 text-gray-800 flex flex-col items-center justify-center">
              <p className="text-lg text-blue-700 mb-2">You spent</p>
              <p className="text-5xl font-bold mb-2">{analytics?.uniqueMerchants || 0}</p>
              <p className="text-lg text-blue-700">on Restaurants &amp; Cafes</p>
            </div>
          </div>
          <div className="grid grid-cols-3  max-md:grid-cols-1 gap-4">
         
            <div className="col-span-2 rounded-xl  flex flex-col p-8 bg-purple-50 text-gray-800 border">
              <h3 className="text-2xl font-bold text-purple-700 mb-6">
             Your top 10 Fashion brands
              </h3>
              <div className="">
                {analytics?.largestTransactions?.slice(0, 10).map((transaction, index) => {
               
              
                  
                  return (
                    <div className="flex justify-between items-center border-b border-purple-200 pb-3 mb-3" key={index}>
                      <div className="flex items-center gap-2">
                        <span className="text-purple-600">#{index + 1}</span>
                        <span className="font-medium text-gray-800">
                        {transaction.description}{" "}&nbsp;
                          <span className="text-gray-500 text-sm">
                 
                          </span>
                        </span>
                      </div>
                      <span className="text-gray-700">
                        ${Math.abs(transaction.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="aspect-[9/16] rounded-xl border p-8 bg-gradient-to-b from-purple-100 to-purple-200 text-gray-800 flex flex-col items-center justify-center">
              <p className="text-lg text-purple-700 mb-2">
                This year you spent
              </p>
              <p className="text-5xl font-bold mb-2 text-purple-950">
                ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-lg text-purple-700">on fashion</p>
            </div>

          </div>
          <div className="grid grid-cols-3  max-md:grid-cols-1 gap-4">
         
         <div className="col-span-2 rounded-xl  flex flex-col p-8 bg-cyan-50 text-gray-800 border">
           <h3 className="text-2xl font-bold text-cyan-700 mb-6">
          Your top 10 Lifestyle Purchases
           </h3>
           <div className="">
             {analytics?.largestTransactions?.slice(0, 10).map((transaction, index) => {
            
           
               
               return (
                 <div className="flex justify-between items-center border-b border-purple-200 pb-3 mb-3" key={index}>
                   <div className="flex items-center gap-2">
                     <span className="text-cyan-600">#{index + 1}</span>
                     <span className="font-medium text-gray-800">
                     {transaction.description}{" "}&nbsp;
                       <span className="text-gray-500 text-sm">
              
                       </span>
                     </span>
                   </div>
                   <span className="text-gray-700">
                     ${Math.abs(transaction.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                   </span>
                 </div>
               );
             })}
           </div>
         </div>
         <div className="aspect-[9/16] rounded-xl border p-8 bg-gradient-to-b from-cyan-100 to-cyan-200 text-gray-800 flex flex-col items-center justify-center">
           <p className="text-lg text-cyan-700 mb-2">
             This year you spent
           </p>
           <p className="text-5xl font-bold mb-2 text-cyan-950">
             ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
           </p>
           <p className="text-lg text-cyan-700">on lifestyle purchases</p>
         </div>

       </div>
       <div className="grid grid-cols-3  max-md:grid-cols-1 gap-4">
         
         <div className="col-span-2 rounded-xl  flex flex-col p-8 bg-lime-50 text-gray-800 border">
           <h3 className="text-2xl font-bold text-lime-700 mb-6">
          Your top 10 Household Purchases
           </h3>
           <div className="">
             {analytics?.largestTransactions?.slice(0, 10).map((transaction, index) => {
            
           
               
               return (
                 <div className="flex justify-between items-center border-b border-lime-200 pb-3 mb-3" key={index}>
                   <div className="flex items-center gap-2">
                     <span className="text-lime-600">#{index + 1}</span>
                     <span className="font-medium text-gray-800">
                     {transaction.description}{" "}&nbsp;
                       <span className="text-gray-500 text-sm">
              
                       </span>
                     </span>
                   </div>
                   <span className="text-gray-700">
                     ${Math.abs(transaction.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                   </span>
                 </div>
               );
             })}
           </div>
         </div>
         <div className="aspect-[9/16] rounded-xl border p-8 bg-gradient-to-b from-lime-100 to-lime-200 text-gray-800 flex flex-col items-center justify-center">
           <p className="text-lg text-lime-700 mb-2">
             This year you spent
           </p>
           <p className="text-5xl font-bold mb-2 text-lime-950">
             ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
           </p>
           <p className="text-lg text-lime-700">on household purchases</p>
         </div>

       </div>
          <div className="grid grid-cols-  max-md:grid-cols-1 gap-4">
         
         <div className=" rounded-xl  flex flex-col p-8 bg-slate-50 text-gray-800 border">
           <h3 className="text-2xl font-bold text-slate-700 mb-6">
             Largest transactions this year
           </h3>
           <div className="">
             {analytics?.largestTransactions?.slice(0, 10).map((transaction, index) => {
               const dateComponents = transaction.date.split('/').map(Number);
               const date = new Date(dateComponents[2], dateComponents[1] - 1, dateComponents[0]);
               const formattedDate = date.toLocaleDateString('en-US', {
                 month: 'short',
                 day: 'numeric'
               });
               
               return (
                 <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-3" key={index}>
                   <div className="flex items-center gap-2">
                     <span className="text-slate-600">#{index + 1}</span>
                     <span className="font-medium text-gray-800">
                     {transaction.description}{" "}&nbsp;
                       <span className="text-gray-500 text-sm">
                       {formattedDate}
                       </span>
                     </span>
                   </div>
                   <span className="text-gray-700">
                     ${Math.abs(transaction.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                   </span>
                 </div>
               );
             })}
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
                              ${category.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                            <br />${category.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (
                            {percentage}%)
                          </span>
                        </div>
                      );
                    })}
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
            <a className="underline text-blue-700" href="https://walt.online">Walter Lim</a> &amp; <a className="underline text-blue-700" href="https://laspruca.nz">Connor Hare</a>.
          </p>
          <p className="mt-2">
            All your financial data stays private and secure.
          </p>
        </div>
      </div>
    </div>
  );
}
