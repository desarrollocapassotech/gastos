import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ProjectedExpenses from "./pages/ProjectedExpenses";
import MonthDetail from "./pages/MonthDetail";
import CategoryDetail from "./pages/CategoryDetail";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "@/hooks/useAuth";
import { ExpenseProvider } from "@/hooks/useExpenseStore";
import Layout from "@/components/Layout";
import ScrollToTop from "@/components/ScrollToTop";
import AddExpense from "./pages/AddExpense";
import AddIncome from "./pages/AddIncome";
import Incomes from "./pages/Incomes";
import Projects from "./pages/Projects";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ExpenseProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route element={<PrivateRoute />}>
                <Route element={<Layout />}>
                  <Route index element={<Index />} />
                  <Route path="/projected" element={<ProjectedExpenses />} />
                  <Route path="/incomes" element={<Incomes />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/expenses/new" element={<AddExpense />} />
                  <Route path="/incomes/new" element={<AddIncome />} />
                  <Route path="/month/:year/:month" element={<MonthDetail />} />
                  <Route path="/category/:category" element={<CategoryDetail />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ExpenseProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

