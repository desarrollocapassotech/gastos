import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { db } from '@/firebase';
import { useAuth } from '@/hooks/useAuth';
import {
  collection,
  collectionGroup,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  installments?: {
    total: number;
    current: number;
    originalAmount: number;
  };
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Casa', color: '#EC4899', icon: '🏠' },
  { id: '2', name: 'Comida', color: '#10B981', icon: '🍽️' },
  { id: '3', name: 'Transporte', color: '#3B82F6', icon: '🚗' },
  { id: '4', name: 'Salidas', color: 'green', icon: '🍷' },
  { id: '5', name: 'Servicios', color: '#F59E0B', icon: '💡' },
  { id: '6', name: 'Salud', color: '#EF4444', icon: '🏥' },
  { id: '7', name: 'Entrenamiento', color: '#8B5CF6', icon: '💪🏼' },
  { id: '8', name: 'Educación', color: '#6366F1', icon: '📚' },
  { id: '9', name: 'Regalos', color: 'pink', icon: '🎁' },
  { id: '10', name: 'Impuestos', color: 'black', icon: '🥷🏻' },
  { id: '11', name: 'Trabajo', color: 'blue', icon: '💻' },
  { id: '12', name: 'Otros', color: '#64748B', icon: '📦' },
];

interface ExpenseContextValue {
  expenses: Expense[];
  categories: Category[];
  addExpense: (expenseData: Omit<Expense, 'id' | 'userId'>) => Promise<void>;
  updateExpense: (
    id: string,
    updatedData: Partial<Omit<Expense, 'id' | 'userId'>>
  ) => Promise<void>;
  addInstallmentExpense: (
    amount: number,
    category: string,
    description: string,
    installments: number,
    startDate?: Date
  ) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addCategory: (
    name: string,
    color: string,
    icon: string
  ) => Promise<Category | null>;
  getExpensesForMonth: (date: Date) => Expense[];
  getTotalForMonth: (date: Date) => number;
  getCategoriesWithTotals: (
    date: Date
  ) => (Category & { total: number })[];
  getProjectedExpenses: () => Record<string, number>;
}

const ExpenseContext = createContext<ExpenseContextValue | null>(null);

export const ExpenseProvider = ({ children }: { children: ReactNode }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const { user } = useAuth();

  // Load data from Firestore when user changes
  useEffect(() => {
    if (!user) {
      setExpenses([]);
      setCategories(DEFAULT_CATEGORIES);
      return;
    }

    const loadData = async () => {
      try {
        // Load categories
        const catCol = collection(db, 'users', user.uid, 'categories');
        const catSnapshot = await getDocs(catCol);
        if (catSnapshot.empty) {
          for (const cat of DEFAULT_CATEGORIES) {
            await setDoc(doc(catCol, cat.id), cat);
          }
          setCategories(DEFAULT_CATEGORIES);
        } else {
          const loadedCats = catSnapshot.docs.map((d) => d.data() as Category);
          setCategories(loadedCats);
        }
      } catch (e) {
        console.error('Error loading categories', e);
      }

      try {
        // Load expenses for user
        const q = query(
          collectionGroup(db, 'expenses'),
          where('userId', '==', user.uid)
        );
        const expenseSnapshot = await getDocs(q);
        const loadedExpenses = expenseSnapshot.docs.map(
          (d) => d.data() as Expense
        );
        setExpenses(loadedExpenses);
      } catch (e) {
        console.error('Error loading expenses', e);
      }
    };
    loadData();
  }, [user]);

  const addExpense = useCallback(
    async (expenseData: Omit<Expense, 'id' | 'userId'>) => {
      if (!user) return;
      const newExpense: Expense = {
        ...expenseData,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        userId: user.uid,
      };
      const monthKey = newExpense.date.substring(0, 7);
      try {
        await setDoc(
          doc(
            db,
            'users',
            user.uid,
            'months',
            monthKey,
            'expenses',
            newExpense.id
          ),
          newExpense
        );
        setExpenses((prev) => [newExpense, ...prev]);
      } catch (e) {
        console.error('Error adding expense', e);
      }
    },
    [user]
  );

  const updateExpense = useCallback(
    async (
      id: string,
      updatedData: Partial<Omit<Expense, 'id' | 'userId'>>
    ) => {
      if (!user) return;
      const oldExpense = expenses.find(
        (e) => e.id === id && e.userId === user.uid
      );
      if (!oldExpense) return;
      const updatedExpense: Expense = { ...oldExpense, ...updatedData };
      const oldMonth = oldExpense.date.substring(0, 7);
      const newMonth = updatedExpense.date.substring(0, 7);
      try {
        if (oldMonth !== newMonth) {
          await deleteDoc(
            doc(db, 'users', user.uid, 'months', oldMonth, 'expenses', id)
          );
          await setDoc(
            doc(db, 'users', user.uid, 'months', newMonth, 'expenses', id),
            updatedExpense
          );
        } else {
          await updateDoc(
            doc(db, 'users', user.uid, 'months', oldMonth, 'expenses', id),
            updatedData as Record<string, unknown>
          );
        }
        setExpenses((prev) =>
          prev.map((expense) => (expense.id === id ? updatedExpense : expense))
        );
      } catch (e) {
        console.error('Error updating expense', e);
      }
    },
    [expenses, user]
  );

  const addInstallmentExpense = useCallback(
    async (
      amount: number,
      category: string,
      description: string,
      installments: number,
      startDate: Date = new Date()
    ) => {
      if (!user) return;
      const monthlyAmount = amount / installments;
      const newExpenses: Expense[] = [];

      for (let i = 0; i < installments; i++) {
        const installmentDate = new Date(startDate);
        installmentDate.setMonth(installmentDate.getMonth() + i);

        const expense: Expense = {
          id: Date.now().toString() + i + Math.random().toString(36).substr(2, 9),
          amount: monthlyAmount,
          category,
          description: `${description} (Cuota ${i + 1}/${installments})`,
          date: installmentDate.toISOString().split('T')[0],
          userId: user.uid,
          installments: {
            total: installments,
            current: i + 1,
            originalAmount: amount,
          },
        };

        newExpenses.push(expense);
        const monthKey = expense.date.substring(0, 7);
        try {
          await setDoc(
            doc(
              db,
              'users',
              user.uid,
              'months',
              monthKey,
              'expenses',
              expense.id
            ),
            expense
          );
        } catch (e) {
          console.error('Error adding installment expense', e);
        }
      }

      setExpenses((prev) => [...newExpenses, ...prev]);
    },
    [user]
  );

  const deleteExpense = useCallback(
    async (id: string) => {
      if (!user) return;
      const expense = expenses.find(
        (e) => e.id === id && e.userId === user.uid
      );
      if (!expense) return;
      const monthKey = expense.date.substring(0, 7);
      try {
        await deleteDoc(
          doc(db, 'users', user.uid, 'months', monthKey, 'expenses', id)
        );
        setExpenses((prev) => prev.filter((e) => e.id !== id));
      } catch (e) {
        console.error('Error deleting expense', e);
      }
    },
    [expenses, user]
  );

  const addCategory = useCallback(
    async (name: string, color: string, icon: string) => {
      if (!user) return null;
      const newCategory: Category = {
        id: Date.now().toString(),
        name,
        color,
        icon,
      };
      try {
        await setDoc(
          doc(db, 'users', user.uid, 'categories', newCategory.id),
          newCategory
        );
        setCategories((prev) => [...prev, newCategory]);
      } catch (e) {
        console.error('Error adding category', e);
      }
      return newCategory;
    },
    [user]
  );

  const getExpensesForMonth = useCallback(
    (date: Date) => {
      const year = date.getFullYear();
      const month = date.getMonth();

      return expenses.filter((expense) => {
        const expenseDate = new Date(expense.date);
        return (
          expenseDate.getFullYear() === year &&
          expenseDate.getMonth() === month
        );
      });
    },
    [expenses]
  );

  const getTotalForMonth = useCallback(
    (date: Date) => {
      return getExpensesForMonth(date).reduce(
        (total, expense) => total + expense.amount,
        0
      );
    },
    [getExpensesForMonth]
  );

  const getCategoriesWithTotals = useCallback(
    (date: Date) => {
      const monthlyExpenses = getExpensesForMonth(date);
      const categoryTotals = monthlyExpenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
      }, {} as Record<string, number>);

      return categories
        .filter((category) => categoryTotals[category.name] > 0)
        .map((category) => ({
          ...category,
          total: categoryTotals[category.name] || 0,
        }))
        .sort((a, b) => b.total - a.total);
    },
    [categories, getExpensesForMonth]
  );

  const getProjectedExpenses = useCallback(() => {
    const monthlyTotals: Record<string, number> = {};

    expenses.forEach((expense) => {
      const monthKey = expense.date.substring(0, 7); // YYYY-MM
      monthlyTotals[monthKey] =
        (monthlyTotals[monthKey] || 0) + expense.amount;
    });

    return monthlyTotals;
  }, [expenses]);

  const value = useMemo(
    () => ({
      expenses,
      categories,
      addExpense,
      updateExpense,
      addInstallmentExpense,
      deleteExpense,
      addCategory,
      getExpensesForMonth,
      getTotalForMonth,
      getCategoriesWithTotals,
      getProjectedExpenses,
    }),
    [
      expenses,
      categories,
      addExpense,
      updateExpense,
      addInstallmentExpense,
      deleteExpense,
      addCategory,
      getExpensesForMonth,
      getTotalForMonth,
      getCategoriesWithTotals,
      getProjectedExpenses,
    ]
  );

  return (
    <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>
  );
};

export const useExpenseStore = () => {
  const context = useContext(ExpenseContext);

  if (!context) {
    throw new Error('useExpenseStore must be used within an ExpenseProvider');
  }

  return context;
};

