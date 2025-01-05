import { useMemo } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import type { Transaction } from "~/types";

export default function TransactionMonthBars({ transactions }: { transactions: Transaction[] }) {
  // Bar chart of each month
  let data = useMemo(() => {
    let months: { [key: string]: number } = {};
    transactions.forEach((t) => {
      let month = t.date.slice(0, 7);
      if (months[month]) {
        months[month] += t.amount;
      } else {
        months[month] = t.amount;
      }
    });
    return Object.keys(months).map((month) => ({
      month,
      total: months[month],
    }));
  }, [transactions]);

  return <div className="absolute right-0 left-0 top-4">
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        <Bar dataKey="total" fill="#ffffff" />
        <XAxis dataKey="month" hide />
        <YAxis hide />
      </BarChart>
    </ResponsiveContainer>
  </div>
}