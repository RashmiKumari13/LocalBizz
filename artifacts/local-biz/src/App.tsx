import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/query-client";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./lib/auth-context";
import { CartProvider } from "./context/CartContext";
import { Navbar } from "./components/layout/Navbar";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import ShopsPage from "@/pages/ShopsPage";
import ShopDetailPage from "@/pages/ShopDetailPage";
import CategoryPage from "@/pages/CategoryPage";
import HealthcarePage from "@/pages/HealthcarePage";
import HealthcareDetailPage from "@/pages/HealthcareDetailPage";
import RegisterPage from "@/pages/RegisterPage";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import AdminPage from "@/pages/AdminPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import CheckoutPage from "@/pages/CheckoutPage";
import OrderHistoryPage from "@/pages/OrderHistoryPage";

function Router() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground font-sans">
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/shops" component={ShopsPage} />
          <Route path="/shops/:id" component={ShopDetailPage} />
          <Route path="/category/:name" component={CategoryPage} />
          <Route path="/healthcare" component={HealthcarePage} />
          <Route path="/healthcare/:id" component={HealthcareDetailPage} />
          <Route path="/register" component={RegisterPage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/dashboard" component={DashboardPage} />
          <Route path="/admin" component={AdminPage} />
          <Route path="/checkout" component={CheckoutPage} />
          <Route path="/orders" component={OrderHistoryPage} />
          <Route path="/forgot-password" component={ForgotPasswordPage} />
          <Route path="/reset-password" component={ResetPasswordPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  const baseUrl = import.meta.env.BASE_URL ?? "/";
  const routerBase = baseUrl.startsWith("/") ? baseUrl.replace(/\/$/, "") : "";

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <WouterRouter base={routerBase}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
