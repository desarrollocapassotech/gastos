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
  projectId?: string;
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

export interface Project {
  id: string;
  name: string;
  color: string;
}

export interface Income {
  id: string;
  userId: string;
  amount: number;
  description: string;
  date: string;
  projectId?: string;
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
  { id: '12', name: 'Transferencias', color: '#A855F7', icon: '🔄' },
  { id: '13', name: 'Otros', color: '#64748B', icon: '📦' },
];

const DEFAULT_PROJECTS: Project[] = [
  { id: 'personal', name: 'Gastos personales', color: '#2563EB' },
];

interface ExpenseContextValue {
  expenses: Expense[];
  incomes: Income[];
  categories: Category[];
  projects: Project[];
  addExpense: (expenseData: Omit<Expense, 'id' | 'userId'>) => Promise<void>;
  addIncome: (incomeData: Omit<Income, 'id' | 'userId'>) => Promise<void>;
  updateExpense: (
    id: string,
    updatedData: Partial<Omit<Expense, 'id' | 'userId'>>
  ) => Promise<void>;
  updateIncome: (
    id: string,
    updatedData: Partial<Omit<Income, 'id' | 'userId'>>
  ) => Promise<void>;
  addInstallmentExpense: (
    amount: number,
    category: string,
    description: string,
    installments: number,
    startDate?: Date,
    projectId?: string
  ) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
  addCategory: (
    name: string,
    color: string,
    icon: string
  ) => Promise<Category | null>;
  updateCategory: (
    id: string,
    updatedData: Partial<Category>
  ) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addProject: (name: string, color: string) => Promise<Project | null>;
  updateProject: (id: string, updatedData: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  getExpensesForMonth: (date: Date) => Expense[];
  getIncomesForMonth: (date: Date) => Income[];
  getExpensesForMonthByProject: (date: Date, projectId?: string | null) => Expense[];
  getIncomesForMonthByProject: (date: Date, projectId?: string | null) => Income[];
  getTotalForMonth: (date: Date, projectId?: string | null) => number;
  getTotalIncomeForMonth: (date: Date) => number;
  getTotalIncomeForMonthByProject: (date: Date, projectId?: string | null) => number;
  getCategoriesWithTotals: (
    date: Date,
    projectId?: string | null
  ) => (Category & { total: number })[];
  getProjectedExpenses: (projectId?: string | null) => Record<string, number>;
}

const ExpenseContext = createContext<ExpenseContextValue | null>(null);

export const ExpenseProvider = ({ children }: { children: ReactNode }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);
  const { user } = useAuth();

  // Load data from Firestore when user changes
  useEffect(() => {
    if (!user) {
      setExpenses([]);
      setIncomes([]);
      setCategories(DEFAULT_CATEGORIES);
      setProjects(DEFAULT_PROJECTS);
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
        const projectCol = collection(db, 'users', user.uid, 'projects');
        const projectSnapshot = await getDocs(projectCol);
        if (projectSnapshot.empty) {
          for (const project of DEFAULT_PROJECTS) {
            await setDoc(doc(projectCol, project.id), project);
          }
          setProjects(DEFAULT_PROJECTS);
        } else {
          const loadedProjects = projectSnapshot.docs.map(
            (d) => d.data() as Project
          );
          setProjects(loadedProjects);
        }
      } catch (e) {
        console.error('Error loading projects', e);
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

      try {
        const incomeQuery = query(
          collectionGroup(db, 'incomes'),
          where('userId', '==', user.uid)
        );
        const incomeSnapshot = await getDocs(incomeQuery);
        const loadedIncomes = incomeSnapshot.docs.map(
          (d) => d.data() as Income
        );
        setIncomes(loadedIncomes);
      } catch (e) {
        console.error('Error loading incomes', e);
      }
    };
    loadData();
  }, [user]);

  const addExpense = useCallback(
    async (expenseData: Omit<Expense, 'id' | 'userId'>) => {
      if (!user) return;
      const fallbackProjectId = expenseData.projectId || projects[0]?.id;
      const newExpense: Expense = {
        ...expenseData,
        projectId: fallbackProjectId,
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
    [projects, user]
  );

  const addIncome = useCallback(
    async (incomeData: Omit<Income, 'id' | 'userId'>) => {
      if (!user) return;
      const fallbackProjectId = incomeData.projectId || projects[0]?.id;
      const newIncome: Income = {
        ...incomeData,
        projectId: fallbackProjectId,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        userId: user.uid,
      };
      const monthKey = newIncome.date.substring(0, 7);
      try {
        await setDoc(
          doc(
            db,
            'users',
            user.uid,
            'months',
            monthKey,
            'incomes',
            newIncome.id
          ),
          newIncome
        );
        setIncomes((prev) => [newIncome, ...prev]);
      } catch (e) {
        console.error('Error adding income', e);
      }
    },
    [projects, user]
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

  const updateIncome = useCallback(
    async (
      id: string,
      updatedData: Partial<Omit<Income, 'id' | 'userId'>>
    ) => {
      if (!user) return;
      const existingIncome = incomes.find(
        (income) => income.id === id && income.userId === user.uid
      );
      if (!existingIncome) return;

      const updatedIncome: Income = { ...existingIncome, ...updatedData };
      const oldMonth = existingIncome.date.substring(0, 7);
      const newMonth = updatedIncome.date.substring(0, 7);

      try {
        if (oldMonth !== newMonth) {
          await deleteDoc(
            doc(db, 'users', user.uid, 'months', oldMonth, 'incomes', id)
          );
          await setDoc(
            doc(db, 'users', user.uid, 'months', newMonth, 'incomes', id),
            updatedIncome
          );
        } else {
          await updateDoc(
            doc(db, 'users', user.uid, 'months', oldMonth, 'incomes', id),
            updatedData as Record<string, unknown>
          );
        }

        setIncomes((prev) =>
          prev.map((income) => (income.id === id ? updatedIncome : income))
        );
      } catch (e) {
        console.error('Error updating income', e);
      }
    },
    [incomes, user]
  );

  const addInstallmentExpense = useCallback(
    async (
      amount: number,
      category: string,
      description: string,
      installments: number,
      startDate: Date = new Date(),
      projectId?: string
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
          projectId,
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

  const deleteIncome = useCallback(
    async (id: string) => {
      if (!user) return;
      const income = incomes.find(
        (entry) => entry.id === id && entry.userId === user.uid
      );
      if (!income) return;

      const monthKey = income.date.substring(0, 7);

      try {
        await deleteDoc(
          doc(db, 'users', user.uid, 'months', monthKey, 'incomes', id)
        );
        setIncomes((prev) => prev.filter((entry) => entry.id !== id));
      } catch (e) {
        console.error('Error deleting income', e);
      }
    },
    [incomes, user]
  );

  const addCategory = useCallback(
    async (name: string, color: string, icon: string) => {
      if (!user) return null;
      const trimmedName = name.trim();
      if (!trimmedName) return null;
      const newCategory: Category = {
        id: Date.now().toString(),
        name: trimmedName,
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

  const updateCategory = useCallback(
    async (id: string, updatedData: Partial<Category>) => {
      if (!user) return;
      const existingCategory = categories.find((category) => category.id === id);
      if (!existingCategory) return;

      try {
        const sanitizedData: Partial<Category> = { ...updatedData };
        if (sanitizedData.name) {
          sanitizedData.name = sanitizedData.name.trim();
        }
        await updateDoc(
          doc(db, 'users', user.uid, 'categories', id),
          sanitizedData as Record<string, unknown>
        );

        if (
          sanitizedData.name &&
          sanitizedData.name !== existingCategory.name
        ) {
          const newName = sanitizedData.name;
          const oldName = existingCategory.name;
          const relatedExpenses = expenses.filter(
            (expense) => expense.category === oldName
          );

          await Promise.all(
            relatedExpenses.map((expense) =>
              updateDoc(
                doc(
                  db,
                  'users',
                  user.uid,
                  'months',
                  expense.date.substring(0, 7),
                  'expenses',
                  expense.id
                ),
                { category: newName }
              )
            )
          );

          setExpenses((prev) =>
            prev.map((expense) =>
              expense.category === oldName
                ? { ...expense, category: newName }
                : expense
            )
          );
        }

        setCategories((prev) =>
          prev.map((category) =>
            category.id === id ? { ...category, ...sanitizedData } : category
          )
        );
      } catch (e) {
        console.error('Error updating category', e);
        throw e;
      }
    },
    [categories, expenses, user]
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      if (!user) return;
      const category = categories.find((item) => item.id === id);
      if (!category) return;

      const hasRelatedExpenses = expenses.some(
        (expense) => expense.category === category.name
      );
      if (hasRelatedExpenses) {
        throw new Error('No puedes eliminar una categoría con gastos asociados.');
      }

      try {
        await deleteDoc(doc(db, 'users', user.uid, 'categories', id));
        setCategories((prev) =>
          prev.filter((existingCategory) => existingCategory.id !== id)
        );
      } catch (e) {
        console.error('Error deleting category', e);
        throw e;
      }
    },
    [categories, expenses, user]
  );

  const addProject = useCallback(
    async (name: string, color: string) => {
      if (!user) return null;
      const newProject: Project = {
        id: Date.now().toString(),
        name,
        color,
      };
      try {
        await setDoc(
          doc(db, 'users', user.uid, 'projects', newProject.id),
          newProject
        );
        setProjects((prev) => [...prev, newProject]);
      } catch (e) {
        console.error('Error adding project', e);
      }
      return newProject;
    },
    [user]
  );

  const updateProject = useCallback(
    async (id: string, updatedData: Partial<Project>) => {
      if (!user) return;
      try {
        await updateDoc(
          doc(db, 'users', user.uid, 'projects', id),
          updatedData as Record<string, unknown>
        );
        setProjects((prev) =>
          prev.map((project) =>
            project.id === id ? { ...project, ...updatedData } : project
          )
        );
      } catch (e) {
        console.error('Error updating project', e);
      }
    },
    [user]
  );

  const deleteProject = useCallback(
    async (id: string) => {
      if (!user) return;
      const hasRelatedExpenses = expenses.some(
        (expense) => expense.projectId === id
      );
      if (hasRelatedExpenses) {
        throw new Error('No puedes eliminar una cuenta con gastos asociados.');
      }
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'projects', id));
        setProjects((prev) => prev.filter((project) => project.id !== id));
      } catch (e) {
        console.error('Error deleting project', e);
      }
    },
    [expenses, user]
  );

  const getMonthKeyFromDate = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

  const getExpensesForMonth = useCallback(
    (date: Date) => {
      const targetMonthKey = getMonthKeyFromDate(date);

      return expenses.filter(
        (expense) => expense.date.slice(0, 7) === targetMonthKey
      );
    },
    [expenses]
  );

  const getIncomesForMonth = useCallback(
    (date: Date) => {
      const targetMonthKey = getMonthKeyFromDate(date);

      return incomes.filter((income) => income.date.slice(0, 7) === targetMonthKey);
    },
    [incomes]
  );

  const getExpensesForMonthByProject = useCallback(
    (date: Date, projectId?: string | null) => {
      const monthlyExpenses = getExpensesForMonth(date);
      if (!projectId) {
        return monthlyExpenses;
      }
      return monthlyExpenses.filter(
        (expense) => expense.projectId === projectId
      );
    },
    [getExpensesForMonth]
  );

  const getIncomesForMonthByProject = useCallback(
    (date: Date, projectId?: string | null) => {
      const monthlyIncomes = getIncomesForMonth(date);
      if (!projectId) {
        return monthlyIncomes;
      }
      return monthlyIncomes.filter(
        (income) => income.projectId === projectId
      );
    },
    [getIncomesForMonth]
  );

  const getTotalForMonth = useCallback(
    (date: Date, projectId?: string | null) => {
      return getExpensesForMonthByProject(date, projectId).reduce(
        (total, expense) => total + expense.amount,
        0
      );
    },
    [getExpensesForMonthByProject]
  );

  const getTotalIncomeForMonth = useCallback(
    (date: Date) => {
      return getIncomesForMonth(date).reduce(
        (total, income) => total + income.amount,
        0
      );
    },
    [getIncomesForMonth]
  );

  const getTotalIncomeForMonthByProject = useCallback(
    (date: Date, projectId?: string | null) => {
      return getIncomesForMonthByProject(date, projectId).reduce(
        (total, income) => total + income.amount,
        0
      );
    },
    [getIncomesForMonthByProject]
  );

  const getCategoriesWithTotals = useCallback(
    (date: Date, projectId?: string | null) => {
      const monthlyExpenses = getExpensesForMonthByProject(date, projectId);
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
    [categories, getExpensesForMonthByProject]
  );

  const getProjectedExpenses = useCallback((projectId?: string | null) => {
    const monthlyTotals: Record<string, number> = {};

    expenses.forEach((expense) => {
      if (projectId && expense.projectId !== projectId) return;
      const monthKey = expense.date.substring(0, 7); // YYYY-MM
      monthlyTotals[monthKey] =
        (monthlyTotals[monthKey] || 0) + expense.amount;
    });

    return monthlyTotals;
  }, [expenses]);

  const value = useMemo(
    () => ({
      expenses,
      incomes,
      categories,
      projects,
      addExpense,
      addIncome,
      updateExpense,
      updateIncome,
      addInstallmentExpense,
      deleteExpense,
      deleteIncome,
      addCategory,
      updateCategory,
      deleteCategory,
      addProject,
      updateProject,
      deleteProject,
      getExpensesForMonth,
      getIncomesForMonth,
      getExpensesForMonthByProject,
      getIncomesForMonthByProject,
      getTotalForMonth,
      getTotalIncomeForMonth,
      getTotalIncomeForMonthByProject,
      getCategoriesWithTotals,
      getProjectedExpenses,
    }),
    [
      expenses,
      incomes,
      categories,
      projects,
      addExpense,
      addIncome,
      updateExpense,
      updateIncome,
      addInstallmentExpense,
      deleteExpense,
      deleteIncome,
      addCategory,
      updateCategory,
      deleteCategory,
      addProject,
      updateProject,
      deleteProject,
      getExpensesForMonth,
      getIncomesForMonth,
      getExpensesForMonthByProject,
      getIncomesForMonthByProject,
      getTotalForMonth,
      getTotalIncomeForMonth,
      getTotalIncomeForMonthByProject,
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

