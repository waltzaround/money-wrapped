import { BANK_CONNECTIONS } from "../utils/akahu";

interface Transaction {
  date: string;
  amount: number;
  description: string;
  merchant?: string;
	_connection?: BANK_CONNECTIONS;
}

interface MonthlySpending {
  month: string;
  monthName: string;
  total: number;
  transactionCount: number;
}

interface MerchantSpending {
  name: string;
  total: number;
  transactionCount: number;
}

interface WeekendSpending {
  total: number;
  transactionCount: number;
  averagePerDay: number;
  weekdayAverage: number;
  percentageHigher: number;
}

interface TransactionAnalytics {
  highestSpendingMonth: MonthlySpending;
  lowestSpendingMonth: MonthlySpending;
  largestTransactions: Transaction[];
  allTransactions: Transaction[];
  totalSpent: number;
  averageTransactionAmount: number;
  transactionCount: number;
  topMerchants: MerchantSpending[];
  weekendSpending: WeekendSpending;
  monthlySpendingArray: MonthlySpending[];
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
  uniqueMerchants: number;
  biggestSpendingDay: {
    date: string;
    total: number;
  };
}



export function analyzeTransactions(transactions: Transaction[]): TransactionAnalytics {
  if (!transactions.length) {
    return {
      highestSpendingMonth: { month: '', monthName: '', total: 0, transactionCount: 0 },
      lowestSpendingMonth: { month: '', monthName: '', total: 0, transactionCount: 0 },
      largestTransactions: [],
      allTransactions: [],
      totalSpent: 0,
      averageTransactionAmount: 0,
      transactionCount: 0,
      topMerchants: [],
      monthlySpendingArray: [],
      weekendSpending: {
        total: 0,
        transactionCount: 0,
        averagePerDay: 0,
        weekdayAverage: 0,
        percentageHigher: 0
      },
      earliestTransaction: { date: '', description: '', amount: 0 },
      latestTransaction: { date: '', description: '', amount: 0 },
      uniqueMerchants: 0,
      biggestSpendingDay: { date: '', total: 0 }
    };
  }

  // Parse and sort transactions by date
  const sortedByDate = [...transactions].filter(t => t && t.date).sort((a, b) => {
    if (!a.date || !b.date) return 0;
    const [dayA, monthA, yearA] = a.date.split('/').map(Number);
    const [dayB, monthB, yearB] = b.date.split('/').map(Number);
    if (!yearA || !monthA || !dayA || !yearB || !monthB || !dayB) return 0;
    const dateA = new Date(yearA, monthA - 1, dayA);
    const dateB = new Date(yearB, monthB - 1, dayB);
    return dateA.getTime() - dateB.getTime();
  });

  const earliestTransaction = sortedByDate[0];
  const latestTransaction = sortedByDate[sortedByDate.length - 1];

  // Track spending by merchant and monthly
  const merchantSpending = new Map<string, MerchantSpending>();
  const monthlySpending = new Map<string, MonthlySpending>();

  // Track daily spending
  const dailySpending = new Map<string, number>();

  let totalSpent = 0;
  let weekendTotal = 0;
  let weekendCount = 0;
  let weekdayTotal = 0;
  let weekdayCount = 0;

  // Process each transaction
  transactions.forEach(transaction => {
    if (typeof transaction.amount !== 'number' || isNaN(transaction.amount)) {
      console.error('Invalid transaction amount:', transaction);
      return;
    }

    if (!transaction.date) {
      console.error('Missing transaction date:', transaction);
      return;
    }

    // Parse DD/MM/YYYY format
    const [day, month, year] = transaction.date.split('/').map(Number);
    if (!day || !month || !year) {
      console.error('Invalid date format:', transaction);
      return;
    }

    const date = new Date(year, month - 1, day);

    if (isNaN(date.getTime())) {
      console.error('Invalid transaction date:', transaction);
      return;
    }

    const dateKey = transaction.date; // Using DD/MM/YYYY format
    const amount = Math.abs(transaction.amount);

    // Track weekend vs weekday spending
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // 0 is Sunday, 6 is Saturday

    if (isWeekend) {
      weekendTotal += amount;
      weekendCount += 1;
    } else {
      weekdayTotal += amount;
      weekdayCount += 1;
    }

    // Track daily spending
    dailySpending.set(dateKey, (dailySpending.get(dateKey) || 0) + amount);

    // Update monthly spending
    const monthKey = `${year}-${String(month).padStart(2, '0')}`;
    if (!monthlySpending.has(monthKey)) {
      monthlySpending.set(monthKey, {
        month: monthKey,
        monthName: '',
        total: 0,
        transactionCount: 0
      });
    }

    const monthData = monthlySpending.get(monthKey)!;
    monthData.total += amount;
    monthData.transactionCount += 1;
    totalSpent += amount;

    // Track merchant spending
    if (transaction.merchant) {
      if (!merchantSpending.has(transaction.merchant)) {
        merchantSpending.set(transaction.merchant, {
          name: transaction.merchant,
          total: 0,
          transactionCount: 0
        });
      }
      const merchantData = merchantSpending.get(transaction.merchant)!;
      merchantData.total += amount;
      merchantData.transactionCount += 1;
    }
  });

  // Convert monthly spending to array and sort
  const monthlySpendingArray = Array.from(monthlySpending.values())
    .map(month => {
      // Convert YYYY-MM format to month name
      const [year, monthNum] = month.month.split('-').map(Number);
      const date = new Date(year, monthNum - 1);
      const monthName = date.toLocaleString('en-US', { month: 'long' });
      return {
        ...month,
        monthName
      };
    })
    .sort((a, b) => b.total - a.total); // Sort by total spent, highest first

  const highestSpendingMonth = monthlySpendingArray[0];
  const lowestSpendingMonth = monthlySpendingArray[monthlySpendingArray.length - 1];

  // Convert merchant spending to array and sort by total spent
  const topMerchants = Array.from(merchantSpending.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Sort transactions by amount for largest transactions
  const sortedTransactions = [...transactions]
    .filter(t => !isNaN(t.amount))
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));

  const weekendAveragePerDay = weekendTotal / (weekendCount || 1);
  const weekdayAveragePerDay = weekdayTotal / (weekdayCount || 1);
  const percentageHigher = ((weekendAveragePerDay - weekdayAveragePerDay) / weekdayAveragePerDay) * 100;

  // Find the biggest spending day
  let biggestSpendingDay = { date: '', total: 0 };
  dailySpending.forEach((total, date) => {
    if (total > biggestSpendingDay.total) {
      biggestSpendingDay = { date, total };
    }
  });

  const uniqueMerchants = merchantSpending.size;

  return {
    highestSpendingMonth,
    lowestSpendingMonth,
    largestTransactions: sortedTransactions.slice(0, 10),
    allTransactions: sortedTransactions,
    totalSpent,
    averageTransactionAmount: totalSpent / transactions.length,
    transactionCount: transactions.length,
    topMerchants,
    weekendSpending: {
      total: weekendTotal,
      transactionCount: weekendCount,
      averagePerDay: weekendAveragePerDay,
      weekdayAverage: weekdayAveragePerDay,
      percentageHigher: percentageHigher
    },
    monthlySpendingArray,
    earliestTransaction,
    latestTransaction,
    uniqueMerchants,
    biggestSpendingDay
  };
}
