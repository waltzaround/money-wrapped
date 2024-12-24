interface Transaction {
  date: string;
  amount: number;
  description: string;
}

interface MonthlySpending {
  month: string;
  total: number;
  transactionCount: number;
}

interface TransactionAnalytics {
  highestSpendingMonth: MonthlySpending;
  lowestSpendingMonth: MonthlySpending;
  largestTransactions: Transaction[];
  totalSpent: number;
  averageTransactionAmount: number;
  transactionCount: number;
  // Easy to add more metrics here
}

export function analyzeTransactions(transactions: Transaction[]): TransactionAnalytics {
  // Group transactions by month
  const monthlySpending = new Map<string, MonthlySpending>();
  
  let totalSpent = 0;
  
  // Process each transaction
  transactions.forEach(transaction => {
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    // Update monthly spending
    if (!monthlySpending.has(monthKey)) {
      monthlySpending.set(monthKey, {
        month: monthKey,
        total: 0,
        transactionCount: 0
      });
    }
    
    const monthData = monthlySpending.get(monthKey)!;
    monthData.total += Math.abs(transaction.amount);
    monthData.transactionCount += 1;
    
    totalSpent += Math.abs(transaction.amount);
  });
  
  // Convert to array and sort for analysis
  const monthlySpendingArray = Array.from(monthlySpending.values());
  
  // Sort transactions by amount for largest transactions
  const sortedTransactions = [...transactions]
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
  
  return {
    highestSpendingMonth: monthlySpendingArray.reduce((max, month) => 
      month.total > max.total ? month : max, 
      monthlySpendingArray[0]
    ),
    lowestSpendingMonth: monthlySpendingArray.reduce((min, month) => 
      month.total < min.total ? month : min, 
      monthlySpendingArray[0]
    ),
    largestTransactions: sortedTransactions.slice(0, 5), // Top 5 largest transactions
    totalSpent,
    averageTransactionAmount: totalSpent / transactions.length,
    transactionCount: transactions.length
  };
}
