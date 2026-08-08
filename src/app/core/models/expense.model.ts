export interface Expense {
  id?: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  paid_by: string;
  split_between: string[];
  created_at?: string;
  created_by?: string;
}

export interface MemberBalance {
  name: string;
  paidTotal: number;
  shareTotal: number;
  netBalance: number; // positive = owed money (+), negative = owes money (-)
}

export interface DebtPair {
  from: string; // member who owes
  to: string;   // member who is owed
  amount: number;
}

export interface NetExpenseSummary {
  memberBalances: MemberBalance[];
  debtPairs: DebtPair[];
  isSettled: boolean;
}
