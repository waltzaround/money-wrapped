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
  earliestTransaction: {
    date: string;
    description: string;
    amount: number;
  };
  latestTransaction: {
    date: string;
    description: string;
    amount: number;
  };
}

export function analyzeTransactions(transactions: Transaction[]): TransactionAnalytics {
  if (!transactions.length) {
    return {
      highestSpendingMonth: { month: '', total: 0, transactionCount: 0 },
      lowestSpendingMonth: { month: '', total: 0, transactionCount: 0 },
      largestTransactions: [],
      totalSpent: 0,
      averageTransactionAmount: 0,
      transactionCount: 0,
      earliestTransaction: { date: '', description: '', amount: 0 },
      latestTransaction: { date: '', description: '', amount: 0 }
    };
  }

  // Parse and sort transactions by date
  const sortedByDate = [...transactions].sort((a, b) => {
    const [dayA, monthA, yearA] = a.date.split('/').map(Number);
    const [dayB, monthB, yearB] = b.date.split('/').map(Number);
    const dateA = new Date(yearA, monthA - 1, dayA);
    const dateB = new Date(yearB, monthB - 1, dayB);
    return dateA.getTime() - dateB.getTime();
  });

  const earliestTransaction = sortedByDate[0];
  const latestTransaction = sortedByDate[sortedByDate.length - 1];

  // Group transactions by month
  const monthlySpending = new Map<string, MonthlySpending>();
  
  let totalSpent = 0;
  
  // Process each transaction
  transactions.forEach(transaction => {
    if (typeof transaction.amount !== 'number' || isNaN(transaction.amount)) {
      console.error('Invalid transaction amount:', transaction);
      return;
    }

    // Parse DD/MM/YYYY format
    const [day, month, year] = transaction.date.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    
    if (isNaN(date.getTime())) {
      console.error('Invalid transaction date:', transaction);
      return;
    }

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
    const amount = Math.abs(transaction.amount);
    monthData.total += amount;
    monthData.transactionCount += 1;
    
    totalSpent += amount;
  });
  
  // Convert to array and sort for analysis
  const monthlySpendingArray = Array.from(monthlySpending.values())
    .sort((a, b) => {
      const [yearA, monthA] = a.month.split('-').map(Number);
      const [yearB, monthB] = b.month.split('-').map(Number);
      return yearA === yearB ? monthA - monthB : yearA - yearB;
    });
  
  if (!monthlySpendingArray.length) {
    return {
      highestSpendingMonth: { month: '', total: 0, transactionCount: 0 },
      lowestSpendingMonth: { month: '', total: 0, transactionCount: 0 },
      largestTransactions: [],
      totalSpent: 0,
      averageTransactionAmount: 0,
      transactionCount: 0,
      earliestTransaction: { date: '', description: '', amount: 0 },
      latestTransaction: { date: '', description: '', amount: 0 }
    };
  }

  // Sort transactions by amount for largest transactions
  const sortedTransactions = [...transactions]
    .filter(t => !isNaN(t.amount))
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
    largestTransactions: sortedTransactions.slice(0, 10), // Top 5 largest transactions
    totalSpent: Number(totalSpent),
    averageTransactionAmount: Number(totalSpent / transactions.length),
    transactionCount: transactions.length,
    earliestTransaction,
    latestTransaction
  };
}
