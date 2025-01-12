import type { Merchant, Transaction } from "~/types";

export enum SubscriptionFrequency {
    DAILY = "Day",
    WEEKLY = "Week",
    FORTNIGHTLY = "Fortnight",
    MONTHLY = "Month",
    BIMONTHLY = "Second Month",
}


export interface Subscription {
    merchant: Merchant;
    total: number;
    individualCharge: number;
    transactionCount: number;
    frequency: SubscriptionFrequency | number;
    transactions: Transaction[];
}

function treatAsUTC(date: string) {
    var result = new Date(date);
    result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
    return result;
}
const day_time = 24 * 60 * 60 * 1000;

const dateDayDiff = (a: Transaction, b: Transaction) => (
    Math.floor((treatAsUTC(a.date).getTime() - treatAsUTC(b.date).getTime()) / (day_time))
);

const dateMonthDiff = (a: Transaction, b: Transaction) => (
    treatAsUTC(a.date).getUTCMonth() - treatAsUTC(b.date).getUTCMonth()
);

function test_subscriptions([id, transactions]: [string, Transaction[]]): Subscription[] {
    // Group by value, and find the most common frequency
    let valueMatch = transactions.reduce((acc, val) => {
        let key = val.amount.toFixed(2);
        let data = acc.get(key) || {count: 0, transactions: []};
        acc.set(key, {
            count: data.count+1,
            transactions: [...data.transactions, val]
        });
        return acc;
    }, new Map<string, {count:number, transactions: Transaction[]}>());

    let transactionSeries = Array.from(valueMatch.entries()).filter(([k, v]) => v.count > 3).sort((a, b) => b[1].count - a[1].count);


    let subscriptions = transactionSeries.map(([amount,series]) => {
        // Sort by date
        let transactions = series.transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Match by day difference
        console.log(transactions)
        let first_day_diff = dateDayDiff(transactions[1], transactions[0]);
        const isDayDiff = transactions.slice(1).every((t, i) => (
            dateDayDiff(transactions[i+1], transactions[i]) == first_day_diff
        ));

        if (isDayDiff) {
            let subscription_freq: SubscriptionFrequency | number = first_day_diff;

            if (first_day_diff == 1) {
                subscription_freq = SubscriptionFrequency.DAILY;
            } else if (first_day_diff == 7) {
                subscription_freq = SubscriptionFrequency.WEEKLY;
            } else if (first_day_diff == 14) {
                subscription_freq = SubscriptionFrequency.FORTNIGHTLY;
            } else if (first_day_diff >= 28 && first_day_diff <= 31) {
                subscription_freq = SubscriptionFrequency.MONTHLY;
            }

            return {
                merchant: transactions[0].merchant!,
                total: transactions.reduce((acc, val) => acc + val.amount, 0),
                transactionCount: transactions.length,
                frequency: subscription_freq,
                transactions,
                individualCharge: transactions[0].amount
            };
        }

        let review_threshold = (Math.min(transactions.length-1, 2));

        let first_month_diff = dateMonthDiff(transactions[1], transactions[0]);
        let isMonthDiff = transactions.slice(1).slice(-review_threshold).every((t, i) => (
            dateMonthDiff(transactions[i+1], transactions[i]) == first_month_diff
        ));

        let day_diffs = transactions.slice(1).slice(-review_threshold).map((t, i) => (
            dateDayDiff(transactions[i+1], transactions[i])
        ));
        isMonthDiff = isMonthDiff &&
                (Math.min(...day_diffs) > (26*first_month_diff)) &&
                (Math.max(...day_diffs) < (32*first_month_diff));

        if (isMonthDiff) {
            let subscription_freq: SubscriptionFrequency | number = first_day_diff;

            if (first_month_diff == 1) {
                subscription_freq = SubscriptionFrequency.MONTHLY;
            } else if (first_month_diff == 2) {
                subscription_freq = SubscriptionFrequency.BIMONTHLY;
            }

            return {
                merchant: transactions[0].merchant!,
                total: transactions.reduce((acc, val) => acc + val.amount, 0),
                transactionCount: transactions.length,
                frequency: subscription_freq,
                transactions,
                individualCharge: transactions[0].amount
            };
        }

        return undefined;

    }).filter((x) => x !== undefined);
    return subscriptions;
}

export function findSubscriptions(transactions: Transaction[]): Subscription[] {
    // Group by merchant
    let merchantMap = new Map<string, Transaction[]>();
    for (let transaction of transactions) {
        const merchant = transaction.merchant;
        if (!merchant) {
            continue;
        }

        let key = merchant.id;


        let subscription = merchantMap.get(key);
        if (!subscription) {
            subscription = [];
            merchantMap.set(key, subscription);
        }
        subscription.push(transaction);
    }

    let subscriptions = Array.from(merchantMap.entries())
            .filter(([id, m])=>m.length>3)
            .map(test_subscriptions)
            .flat();


    return subscriptions;
}