
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
  { id: '1', name: 'Alimentación', color: '#10B981', icon: '🍽️' },
  { id: '2', name: 'Transporte', color: '#3B82F6', icon: '🚗' },
  { id: '3', name: 'Salud', color: '#EF4444', icon: '🏥' },
  { id: '4', name: 'Entretenimiento', color: '#8B5CF6', icon: '🎬' },
  { id: '5', name: 'Servicios', color: '#F59E0B', icon: '💡' },
  { id: '6', name: 'Compras', color: '#EC4899', icon: '🛍️' },
  { id: '7', name: 'Educación', color: '#6366F1', icon: '📚' },
  { id: '8', name: 'Otros', color: '#64748B', icon: '📦' },
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
    localStorage.setItem('expenses', JSON.stringify(expenses));
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
    addInstallmentExpense,
    deleteExpense,
    addCategory,
    getExpensesForMonth,
    getTotalForMonth,
    getCategoriesWithTotals,
    getProjectedExpenses,
  };
};
