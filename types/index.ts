export interface Category {
  id: string;
  name: string;
  emoji: string;
  budget: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  categoryId: string;
  date: string;
  monthKey: string;
}

export interface MonthConfig {
  monthKey: string;
  income: number;
  savingsGoal: number;
  categories: Category[];
}

export interface MonthSummary {
  monthKey: string;
  income: number;
  savingsGoal: number;
  totalSpent: number;
  totalSaved: number;
  categories: Category[];
  isGoalReached: boolean;
}

export interface SavingsGoal {
  id: string;
  name: string;
  emoji: string;
  targetAmount: number;
  allocatedAmount: number;
  createdAt: string;
}

export interface AppData {
  currentMonthConfig: MonthConfig | null;
  expenses: Expense[];
  monthSummaries: MonthSummary[];
  savingsGoals: SavingsGoal[];
  totalSavings: number;
  freeSavings: number;
  lastOpenedMonth: string;
}
