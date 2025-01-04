import { Link } from "react-router";
import { Helmet } from "react-helmet";
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
import {  Wallet } from "lucide-react";

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
      <Helmet>
        <title>Welcome to Money Wrapped - Your Financial Year in Review</title>
        <meta name="description" content="Get started with Money Wrapped and discover insights about your spending habits and financial patterns with our personalized year-end financial review." />
        <meta property="og:title" content="Welcome to Money Wrapped - Your Financial Year in Review" />
        <meta property="og:description" content="Get started with Money Wrapped and discover insights about your spending habits and financial patterns with our personalized year-end financial review." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Welcome to Money Wrapped - Your Financial Year in Review" />
        <meta name="twitter:description" content="Get started with Money Wrapped and discover insights about your spending habits and financial patterns with our personalized year-end financial review." />
      </Helmet>
      <main 
        className="min-h-screen bg-gradient-to-b from-gray-50 to-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Hero Section */}
          <section 
            className="text-start mb-16"
          >
            <div 
              className="inline-block mb-6"
            >
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl w-20 h-20 shadow-lg flex items-center justify-center">
                <Wallet className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent mb-6">
              Money Wrapped 2024
            </h1>
            <p className="text-2xl text-gray-600 max-w-4xl tracking-tight leading-relaxed">
              Discover your 2024 financial story. Learn about your spending habits in minutes.<br/>Only works for New Zealand bank accounts and transactions.
              
            </p>
          </section>

          {/* Get Started Section */}
          <section className="mb-20">
            <div className="grid md:grid-cols-2 gap-6">
              <div
          
                className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-white p-6 shadow-lg transition-all hover:shadow-xl"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-emerald-500/0 rounded-bl-3xl"></div>
                <div className="text-xs font-semibold mb-3 rounded-full px-4 py-1 bg-emerald-100 text-emerald-700 w-fit">Automatic</div>
                <h3 className="text-2xl font-bold text-emerald-700 mb-3">
                  Connect Bank Accounts
                </h3>
                <p className="text-gray-600 mb-6 min-h-[6rem]">
                  Securely connect with Akahu for instant analysis. Your data remains private and only you have access to your data - verify this in our open-source code.
                </p>
                <Link to="/account">
                  <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-xl transition-all">
                    Connect Accounts →
                  </Button>
                </Link>
              </div>

              <div
                className="relative overflow-hidden rounded-2xl border border-blue-100 bg-white p-6 shadow-lg transition-all hover:shadow-xl"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-blue-500/0 rounded-bl-3xl"></div>
                <div className="text-xs font-semibold mb-3 rounded-full px-4 py-1 bg-blue-100 text-blue-700 w-fit">Manual</div>
                <h3 className="text-2xl font-bold text-blue-700 mb-3">
                  Upload CSV Files
                </h3>
                <p className="text-gray-600 mb-6 min-h-[6rem]">
                  Don't trust the system with your bank credentials? No worries! Upload your bank statement CSV files instead for the same experience. You will need to do some manual work to format the CSV files for this to work.
                </p>
                <Link to="/csv">
                  <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transition-all">
                    Upload CSV →
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Demo Section */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">
                Preview Your 2024 Story  
              </h2>
              <p className="text-gray-600 mt-2">
                Here's an example of what your 2024 money wrapped could look like
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div
                className="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-8 text-white shadow-lg"
              >
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <p className="text-emerald-100">You spent </p>
                  <p className="text-5xl font-bold">$12,300</p>
                  <p className="text-emerald-100">in 2024</p>
                </div>
              </div>

              <div
                className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 p-8 text-white shadow-lg"
              >
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <p className="text-blue-100">You shopped at</p>
                  <p className="text-5xl font-bold">301</p>
                  <p className="text-blue-100">different businesses</p>
                </div>
              </div>

              <div
                className="rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 p-8 text-white shadow-lg"
              >
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <p className="text-purple-100">You made</p>
                  <p className="text-5xl font-bold">1,230</p>
                  <p className="text-purple-100">transactions</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white  shadow-lg">
              <div className="flex justify-between items-center p-4 mb-4 border-b">
                <h3 className="text-xl font-semibold text-gray-900">Your Spending</h3>
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

              <div className="h-[400px] w-full p-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={spendingData[selectedPeriod as keyof typeof spendingData]}
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
                            <div className="rounded-lg border bg-white p-3 shadow-lg">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="font-medium text-gray-600">
                                  {payload[0].payload.period}
                                </div>
                                <div className="text-right font-bold text-emerald-600">
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
                      radius={[6, 6, 0, 0]}
                      className="fill-emerald-500 hover:fill-emerald-600"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div
           
                className="rounded-2xl bg-gradient-to-br from-pink-500 to-pink-700 p-8 text-white shadow-lg flex items-center justify-center"
              >
                <div className="flex flex-col items-center justify-center space-y-4">
                  <p className="text-pink-100">Biggest Spending Day</p>
                  <p className="text-4xl font-bold">24 December</p>
                  <p className="text-6xl font-bold">$3,432</p>
               
                </div>
              </div>

              <div
     
                className="rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 p-8 text-white shadow-lg "
              >
                <p className="text-xl font-semibold mb-6">Top Places</p>
                <div className="space-y-4">
                  {[
                    { name: "Countdown", count: 42 },
                    { name: "BP Connect", count: 28 },
                    { name: "Starbucks", count: 24 },
                    { name: "McDonald's", count: 19 },
                    { name: "Bunnings", count: 15 },
                  ].map((place, i) => (
                    <div key={place.name} className="flex items-center gap-3">
                      <span className="text-2xl font-bold">{i + 1}</span>
                      <div>
                        <p className="font-semibold">{place.name}</p>
                        <p className="text-orange-200">$2,000 spent over {place.count} visits</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
     
                className="rounded-2xl bg-gradient-to-br from-lime-500 to-lime-700 p-8 text-white shadow-lg flex items-center justify-center"
              >
                <div className="flex flex-col items-center justify-center space-y-4">
                  <p className="text-lime-100">Largest Purchase</p>
                  <p className="text-3xl font-bold">PB Tech</p>
                  <p className="text-6xl font-bold">$1,432</p>
                
                </div>
              </div>
            </div>
          </section>
          <footer className="mt-16 pb-8 text-center text-sm text-gray-500 flex flex-col gap-2">
            <div>
            Built with care by{" "}
            <a href="https://walt.online" className="underline hover:text-gray-700">Walter Lim</a>,{" "}
            <a href="https://laspruca.nz" className="underline hover:text-gray-700">Connor Hare</a>, and{" "}
            <a href="https://jmw.nz" className="underline hover:text-gray-700">Jasper Miller-Waugh</a>
            </div>
            <div>
            Made possible with support from{" "}
            <a href="https://akahu.nz" className="underline hover:text-gray-700">Akahu</a>
            </div>
          </footer>
        </div>
      </main>
    </>
  );
}
