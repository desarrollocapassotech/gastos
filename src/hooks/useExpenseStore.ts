
import { useState, useEffect } from 'react';

export interface Expense {
  id: string;
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

export const useExpenseStore = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedExpenses = localStorage.getItem('expenses');
    const savedCategories = localStorage.getItem('categories');

    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }

    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }
  }, []);

  // Save to localStorage whenever expenses change
  useEffect(() => {
    try {
      if (!expenses || !Array.isArray(expenses)) {
        console.error("Expenses is not an array or is undefined");
        return;
      }
      // Ensure expenses is an array before saving
      if (expenses.length === 0) {
        console.warn("No expenses to save");
      }
      // Convert to JSON and save
      if (expenses.some(expense => typeof expense !== 'object')) {
        console.error("Expenses contains non-object items");
        return;
      }
      if (expenses.some(expense => !expense.id || !expense.amount || !expense.category || !expense.description || !expense.date)) {
        console.error("Expenses contains incomplete items");
        return;
      }
      // Save to localStorage
      if (expenses.length > 0) {
        console.log("Saving expenses to localStorage", expenses);
        localStorage.setItem('expenses', JSON.stringify(expenses));
      }
    } catch (e) {
      console.error("No se pudo guardar en localStorage", e);
    }
  }, [expenses]);

  // Save to localStorage whenever categories change
  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  const addExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };

    setExpenses(prev => [newExpense, ...prev]);
  };

  const updateExpense = (id: string, updatedData: Partial<Omit<Expense, 'id'>>) => {
    setExpenses(prev =>
      prev.map(expense =>
        expense.id === id ? { ...expense, ...updatedData } : expense
      )
    );
  };

  const addInstallmentExpense = (
    amount: number,
    category: string,
    description: string,
    installments: number,
    startDate: Date = new Date()
  ) => {
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
        installments: {
          total: installments,
          current: i + 1,
          originalAmount: amount,
        },
      };

      newExpenses.push(expense);
    }

    setExpenses(prev => [...newExpenses, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  const addCategory = (name: string, color: string, icon: string) => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name,
      color,
      icon,
    };
    setCategories(prev => [...prev, newCategory]);
    return newCategory;
  };

  const getExpensesForMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getFullYear() === year && expenseDate.getMonth() === month;
    });
  };

  const getTotalForMonth = (date: Date) => {
    return getExpensesForMonth(date).reduce((total, expense) => total + expense.amount, 0);
  };

  const getCategoriesWithTotals = (date: Date) => {
    const monthlyExpenses = getExpensesForMonth(date);
    const categoryTotals = monthlyExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return categories
      .filter(category => categoryTotals[category.name] > 0)
      .map(category => ({
        ...category,
        total: categoryTotals[category.name] || 0,
      }))
      .sort((a, b) => b.total - a.total);
  };

  const getProjectedExpenses = () => {
    const monthlyTotals: Record<string, number> = {};

    expenses.forEach(expense => {
      const monthKey = expense.date.substring(0, 7); // YYYY-MM
      monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + expense.amount;
    });

    return monthlyTotals;
  };

  return {
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
  };
};
