export interface Transaction {
  date: string;
  amount: number;
  description: string;
}

export interface MonthlySpending {
  month: string;
  monthName: string;
  total: number;
  transactionCount: number;
}

export interface MerchantSpending {
  name: string;
  total: number;
  transactionCount: number;
}

export interface WeekendSpending {
  total: number;
  transactionCount: number;
  percentage: number;
}

export interface TransactionAnalytics {
  allTransactions: any;
  cafeVisits: number;
  biggestDay: any;
  uniqueMerchants: number;
  highestSpendingMonth: MonthlySpending;
  lowestSpendingMonth: MonthlySpending;
  largestTransactions: Transaction[];
  totalSpent: number;
  averageTransactionAmount: number;
  transactionCount: number;
  topMerchants: MerchantSpending[];
  weekendSpending: WeekendSpending;
  monthlySpendingArray: MonthlySpending[];
  earliestTransaction: Transaction;
  latestTransaction: Transaction;
}
