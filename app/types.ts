export interface Transaction {
  date: string;
  amount: number;
  description: string;
  id: string;
  direction: "DEBIT" | "CREDIT";
  _connection: string;
  merchant?: Merchant;
  category?: TransactionCategory;
  connection: {id: string};
  meta?: TransactionMeta;
}

export interface TransactionCategory {
  name: string;
  group: {personal_finance: TransactionGroup};
}

export interface TransactionGroup {
  _id: string
  name: string;
}

export interface TransactionMeta {
  particulars?: string;
  code?: string;
  reference?: string;
  other_account?: string;
  conversion?: { amount: number; currency: string; rate: number };
  card_suffix?: string;
  logo?: string;
}

export interface Merchant {
  id: string;
  name: string;
  category: string;
  logo?: string;
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
  biggestSpendingDay: any;
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
