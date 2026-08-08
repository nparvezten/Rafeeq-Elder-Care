import { Injectable, inject, signal, computed } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Expense, MemberBalance, DebtPair, NetExpenseSummary } from '../models/expense.model';

const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
    description: 'Weekly Attendant Fee (Rashid Khan)',
    category: 'Attendant Fee',
    amount: 4800,
    paid_by: 'Fatima',
    split_between: ['Fatima', 'Tariq', 'Zainab'],
    created_at: new Date().toISOString()
  },
  {
    id: 'exp-2',
    date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    description: 'Wheelchair Ramp & Non-slip Bath Mats',
    category: 'Equipment & Home Adaptation',
    amount: 3600,
    paid_by: 'Tariq',
    split_between: ['Fatima', 'Tariq', 'Zainab'],
    created_at: new Date().toISOString()
  },
  {
    id: 'exp-3',
    date: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0],
    description: 'Weekly Grocery & Fresh Soup Supplies',
    category: 'Food & Nutrition',
    amount: 1800,
    paid_by: 'Zainab',
    split_between: ['Fatima', 'Tariq', 'Zainab'],
    created_at: new Date().toISOString()
  }
];

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private supabaseService = inject(SupabaseService);

  readonly expenses = signal<Expense[]>(INITIAL_EXPENSES);
  readonly isLoading = signal<boolean>(false);

  // Client-side computed Net Balance Summary
  readonly summary = computed<NetExpenseSummary>(() => {
    const list = this.expenses();
    const memberPaid = new Map<string, number>();
    const memberShare = new Map<string, number>();
    const allMembers = new Set<string>();

    for (const exp of list) {
      const payer = exp.paid_by.trim();
      const amount = Number(exp.amount) || 0;
      const splitList = (exp.split_between || []).map(m => m.trim()).filter(Boolean);

      if (payer) {
        allMembers.add(payer);
        memberPaid.set(payer, (memberPaid.get(payer) || 0) + amount);
      }

      if (splitList.length > 0) {
        const perPersonShare = amount / splitList.length;
        for (const member of splitList) {
          allMembers.add(member);
          memberShare.set(member, (memberShare.get(member) || 0) + perPersonShare);
        }
      }
    }

    const memberBalances: MemberBalance[] = [];
    const debtors: { name: string; amount: number }[] = [];
    const creditors: { name: string; amount: number }[] = [];

    allMembers.forEach(name => {
      const paidTotal = memberPaid.get(name) || 0;
      const shareTotal = memberShare.get(name) || 0;
      const netBalance = Math.round((paidTotal - shareTotal) * 100) / 100;

      memberBalances.push({
        name,
        paidTotal,
        shareTotal,
        netBalance
      });

      if (netBalance < -0.01) {
        debtors.push({ name, amount: Math.abs(netBalance) });
      } else if (netBalance > 0.01) {
        creditors.push({ name, amount: netBalance });
      }
    });

    const debtPairs: DebtPair[] = [];
    let i = 0;
    let j = 0;

    const dList = [...debtors];
    const cList = [...creditors];

    while (i < dList.length && j < cList.length) {
      const debtor = dList[i];
      const creditor = cList[j];
      const settledAmount = Math.min(debtor.amount, creditor.amount);

      if (settledAmount > 0.01) {
        debtPairs.push({
          from: debtor.name,
          to: creditor.name,
          amount: Math.round(settledAmount * 100) / 100
        });
      }

      debtor.amount -= settledAmount;
      creditor.amount -= settledAmount;

      if (debtor.amount < 0.01) i++;
      if (creditor.amount < 0.01) j++;
    }

    const isSettled = memberBalances.every(m => Math.abs(m.netBalance) < 0.01);

    return {
      memberBalances: memberBalances.sort((a, b) => b.netBalance - a.netBalance),
      debtPairs,
      isSettled
    };
  });

  constructor() {
    this.loadExpenses();
  }

  async loadExpenses() {
    const supabase = this.supabaseService.supabase;
    if (!supabase) return;

    this.isLoading.set(true);
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      if (!error && data && data.length > 0) {
        this.expenses.set(data as Expense[]);
      }
    } catch (err) {
      console.warn('Supabase offline or schema pending, using demo initial data:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  async addExpense(expense: Omit<Expense, 'id' | 'created_at'>): Promise<{ error: Error | null }> {
    const supabase = this.supabaseService.supabase;
    const user = this.supabaseService.currentUser();

    const newRecord: Expense = {
      ...expense,
      id: 'exp-' + Date.now(),
      created_at: new Date().toISOString(),
      created_by: user?.id
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('expenses')
          .insert([
            {
              date: expense.date,
              description: expense.description,
              category: expense.category,
              amount: expense.amount,
              paid_by: expense.paid_by,
              split_between: expense.split_between,
              created_by: user?.id
            }
          ])
          .select();

        if (error) {
          console.warn('Supabase table missing or offline. Falling back to local state:', error.message);
          this.expenses.update(current => [newRecord, ...current]);
          return { error: null };
        }
        if (data && data.length > 0) {
          this.expenses.update(current => [data[0] as Expense, ...current]);
          return { error: null };
        }
      } catch (err) {
        console.warn('Supabase exception. Falling back to local state:', err);
        this.expenses.update(current => [newRecord, ...current]);
        return { error: null };
      }
    }

    // Direct local state update for zero-config run
    this.expenses.update(current => [newRecord, ...current]);
    return { error: null };
  }
}
