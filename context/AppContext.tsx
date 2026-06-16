import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppData, Category, Expense, MonthConfig, SavingsGoal, MonthSummary } from '../types';
import { STORAGE_KEYS } from '../constants/storage';

const DEFAULT_APP_DATA: AppData = {
  currentMonthConfig: null,
  expenses: [],
  monthSummaries: [],
  savingsGoals: [],
  totalSavings: 0,
  freeSavings: 0,
  lastOpenedMonth: '',
};

function getCurrentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthsGap(from: string, to: string): number {
  const [fy, fm] = from.split('-').map(Number);
  const [ty, tm] = to.split('-').map(Number);
  return (ty - fy) * 12 + (tm - fm);
}

function getIntermediateMonthKeys(from: string, to: string): string[] {
  const gap = getMonthsGap(from, to);
  if (gap <= 1) return [];
  const keys: string[] = [];
  let [y, m] = from.split('-').map(Number);
  for (let i = 1; i < gap; i++) {
    m++;
    if (m > 12) { m = 1; y++; }
    keys.push(`${y}-${String(m).padStart(2, '0')}`);
  }
  return keys;
}

type Action =
  | { type: 'LOAD_DATA'; payload: AppData }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'SET_MONTH_CONFIG'; payload: MonthConfig }
  | { type: 'ADD_SAVINGS_GOAL'; payload: SavingsGoal }
  | { type: 'ALLOCATE_TO_GOAL'; payload: { goalId: string; amount: number } }
  | { type: 'DELETE_SAVINGS_GOAL'; payload: string }
  | { type: 'DELETE_CATEGORY_AND_REASSIGN'; payload: { deletedId: string; newCategories: Category[] } }
  | { type: 'START_NEW_MONTH'; payload: { mode: 'carry' | 'customize'; summary: MonthSummary; newConfig: MonthConfig; savings: number; intermediateSummaries: MonthSummary[] } };

function reducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case 'LOAD_DATA':
      return action.payload;

    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, action.payload] };

    case 'DELETE_EXPENSE':
      return { ...state, expenses: state.expenses.filter(e => e.id !== action.payload) };

    case 'SET_MONTH_CONFIG':
      return {
        ...state,
        currentMonthConfig: action.payload,
        lastOpenedMonth: action.payload.monthKey,
      };

    case 'ADD_SAVINGS_GOAL':
      return { ...state, savingsGoals: [...state.savingsGoals, action.payload] };

    case 'ALLOCATE_TO_GOAL': {
      const { goalId, amount } = action.payload;
      return {
        ...state,
        freeSavings: state.freeSavings - amount,
        savingsGoals: state.savingsGoals.map(g =>
          g.id === goalId ? { ...g, allocatedAmount: g.allocatedAmount + amount } : g
        ),
      };
    }

    case 'DELETE_SAVINGS_GOAL': {
      const goal = state.savingsGoals.find(g => g.id === action.payload);
      return {
        ...state,
        freeSavings: state.freeSavings + (goal?.allocatedAmount ?? 0),
        savingsGoals: state.savingsGoals.filter(g => g.id !== action.payload),
      };
    }

    case 'DELETE_CATEGORY_AND_REASSIGN': {
      const { deletedId, newCategories } = action.payload;
      return {
        ...state,
        expenses: state.expenses.map(e =>
          e.categoryId === deletedId ? { ...e, categoryId: 'autre' } : e
        ),
        currentMonthConfig: state.currentMonthConfig
          ? { ...state.currentMonthConfig, categories: newCategories }
          : null,
      };
    }

    case 'START_NEW_MONTH': {
      const { summary, newConfig, savings, intermediateSummaries } = action.payload;
      const allNewSummaries = [...intermediateSummaries, summary];
      let updatedSummaries = state.monthSummaries;
      for (const s of allNewSummaries) {
        const existing = updatedSummaries.find(x => x.monthKey === s.monthKey);
        updatedSummaries = existing
          ? updatedSummaries.map(x => x.monthKey === s.monthKey ? s : x)
          : [...updatedSummaries, s];
      }
      return {
        ...state,
        currentMonthConfig: newConfig,
        monthSummaries: updatedSummaries,
        totalSavings: state.totalSavings + savings,
        freeSavings: state.freeSavings + savings,
        lastOpenedMonth: newConfig.monthKey,
      };
    }

    default:
      return state;
  }
}

interface AppContextType {
  data: AppData;
  isLoading: boolean;
  pendingGapMonths: number;
  addExpense: (expense: Omit<Expense, 'id' | 'monthKey'>) => void;
  deleteExpense: (id: string) => void;
  setMonthConfig: (config: MonthConfig) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'allocatedAmount' | 'createdAt'>, initialAllocation?: number) => void;
  allocateToGoal: (goalId: string, amount: number) => void;
  deleteSavingsGoal: (id: string) => void;
  deleteCategoryAndReassign: (categoryId: string, newCategories: Category[]) => void;
  loadData: (data: AppData) => void;
  resetData: () => void;
  clearPendingGapMonths: () => void;
  startNewMonth: (mode: 'carry' | 'customize', customConfig?: MonthConfig) => void;
  getCurrentMonthExpenses: () => Expense[];
  getCategorySpent: (categoryId: string) => number;
  checkMonthChange: () => { changed: boolean; prevMonthKey: string; monthsGap: number };
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, dispatch] = useReducer(reducer, DEFAULT_APP_DATA);
  const [isLoading, setIsLoading] = React.useState(true);
  const [pendingGapMonths, setPendingGapMonths] = React.useState(0);

  useEffect(() => {
    (async () => {
      try {
        // Migrate from old storage key if present
        const legacy = await AsyncStorage.getItem(STORAGE_KEYS.LEGACY_APP_DATA);
        if (legacy) {
          await AsyncStorage.setItem(STORAGE_KEYS.APP_DATA, legacy);
          await AsyncStorage.removeItem(STORAGE_KEYS.LEGACY_APP_DATA);
        }
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.APP_DATA);
        if (raw) {
          dispatch({ type: 'LOAD_DATA', payload: JSON.parse(raw) });
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.setItem(STORAGE_KEYS.APP_DATA, JSON.stringify(data));
    }
  }, [data, isLoading]);

  const addExpense = useCallback((expense: Omit<Expense, 'id' | 'monthKey'>) => {
    const monthKey = getCurrentMonthKey();
    const full: Expense = { ...expense, id: Date.now().toString(), monthKey };
    dispatch({ type: 'ADD_EXPENSE', payload: full });
  }, []);

  const deleteExpense = useCallback((id: string) => {
    dispatch({ type: 'DELETE_EXPENSE', payload: id });
  }, []);

  const setMonthConfig = useCallback((config: MonthConfig) => {
    dispatch({ type: 'SET_MONTH_CONFIG', payload: config });
  }, []);

  const addSavingsGoal = useCallback((
    goal: Omit<SavingsGoal, 'id' | 'allocatedAmount' | 'createdAt'>,
    initialAllocation = 0,
  ) => {
    const full: SavingsGoal = {
      ...goal,
      id: Date.now().toString(),
      allocatedAmount: initialAllocation,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_SAVINGS_GOAL', payload: full });
    if (initialAllocation > 0) {
      dispatch({ type: 'ALLOCATE_TO_GOAL', payload: { goalId: full.id, amount: initialAllocation } });
    }
  }, []);

  const allocateToGoal = useCallback((goalId: string, amount: number) => {
    dispatch({ type: 'ALLOCATE_TO_GOAL', payload: { goalId, amount } });
  }, []);

  const deleteSavingsGoal = useCallback((id: string) => {
    dispatch({ type: 'DELETE_SAVINGS_GOAL', payload: id });
  }, []);

  const deleteCategoryAndReassign = useCallback((categoryId: string, newCategories: Category[]) => {
    dispatch({ type: 'DELETE_CATEGORY_AND_REASSIGN', payload: { deletedId: categoryId, newCategories } });
  }, []);

  const loadData = useCallback((importedData: AppData) => {
    dispatch({ type: 'LOAD_DATA', payload: importedData });
  }, []);

  const resetData = useCallback(() => {
    dispatch({ type: 'LOAD_DATA', payload: { ...DEFAULT_APP_DATA } });
  }, []);

  const clearPendingGapMonths = useCallback(() => {
    setPendingGapMonths(0);
  }, []);

  const getCurrentMonthExpenses = useCallback((): Expense[] => {
    const monthKey = getCurrentMonthKey();
    return data.expenses.filter(e => e.monthKey === monthKey);
  }, [data.expenses]);

  const getCategorySpent = useCallback((categoryId: string): number => {
    const monthKey = getCurrentMonthKey();
    return data.expenses
      .filter(e => e.categoryId === categoryId && e.monthKey === monthKey)
      .reduce((sum, e) => sum + e.amount, 0);
  }, [data.expenses]);

  const checkMonthChange = useCallback((): { changed: boolean; prevMonthKey: string; monthsGap: number } => {
    const currentMonthKey = getCurrentMonthKey();
    const prevMonthKey = data.lastOpenedMonth;
    const changed = prevMonthKey !== '' && prevMonthKey !== currentMonthKey;
    const monthsGap = changed ? getMonthsGap(prevMonthKey, currentMonthKey) : 0;
    return { changed, prevMonthKey, monthsGap };
  }, [data.lastOpenedMonth]);

  const startNewMonth = useCallback((mode: 'carry' | 'customize', customConfig?: MonthConfig) => {
    const currentMonthKey = getCurrentMonthKey();
    const prevMonthKey = data.lastOpenedMonth;
    const prevExpenses = data.expenses.filter(e => e.monthKey === prevMonthKey);
    const totalSpent = prevExpenses.reduce((sum, e) => sum + e.amount, 0);
    const income = data.currentMonthConfig?.income ?? 0;
    const savingsGoal = data.currentMonthConfig?.savingsGoal ?? 0;
    const totalSaved = income - totalSpent;

    const summary: MonthSummary = {
      monthKey: prevMonthKey,
      income,
      savingsGoal,
      totalSpent,
      totalSaved,
      categories: data.currentMonthConfig?.categories ?? [],
      isGoalReached: totalSaved >= savingsGoal,
    };

    const intermediateKeys = getIntermediateMonthKeys(prevMonthKey, currentMonthKey);
    const intermediateSummaries: MonthSummary[] = intermediateKeys.map(mk => ({
      monthKey: mk,
      income,
      savingsGoal,
      totalSpent: 0,
      totalSaved: 0,
      categories: data.currentMonthConfig?.categories ?? [],
      isGoalReached: false,
    }));

    if (intermediateKeys.length > 0) {
      setPendingGapMonths(intermediateKeys.length);
    }

    let newConfig: MonthConfig;
    if (mode === 'carry' && data.currentMonthConfig) {
      newConfig = { ...data.currentMonthConfig, monthKey: currentMonthKey };
    } else if (customConfig) {
      newConfig = customConfig;
    } else {
      newConfig = {
        monthKey: currentMonthKey,
        income: data.currentMonthConfig?.income ?? 0,
        savingsGoal: data.currentMonthConfig?.savingsGoal ?? 0,
        categories: data.currentMonthConfig?.categories ?? [],
      };
    }

    dispatch({
      type: 'START_NEW_MONTH',
      payload: { mode, summary, newConfig, savings: Math.max(0, totalSaved), intermediateSummaries },
    });
  }, [data]);

  return (
    <AppContext.Provider value={{
      data,
      isLoading,
      pendingGapMonths,
      addExpense,
      deleteExpense,
      setMonthConfig,
      addSavingsGoal,
      allocateToGoal,
      deleteSavingsGoal,
      deleteCategoryAndReassign,
      loadData,
      resetData,
      clearPendingGapMonths,
      startNewMonth,
      getCurrentMonthExpenses,
      getCategorySpent,
      checkMonthChange,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
