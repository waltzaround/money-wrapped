import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Transaction } from "~/types";

export default function TransactionSparkLine({ transactions }: { transactions: Transaction[] }) {
  let data = transactions.map((t) => ({
    date: new Date(t.date),
    amount: -t.amount,
  }));
  console.log(data);

  return (
    <div className="absolute right-0 left-0 bottom-4">
        <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
            <Line
            type="monotone"
            dataKey="amount"
            stroke="#ffffff"
            strokeWidth={2}
            dot={false}
            />
            <XAxis dataKey="date" hide />
            <YAxis scale="log" domain={['auto', 'auto']} hide />
            {/* <Tooltip content={<CustomTooltip />} /> */}
        </LineChart>
        </ResponsiveContainer>

    </div>
  );
}