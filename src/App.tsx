import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AuthProvider } from "@/lib/auth";
import { RequireAuth } from "@/components/RequireAuth";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import NewCompany from "./pages/NewCompany";
import CompanySettings from "./pages/CompanySettings";
import ZohoConnect from "./pages/ZohoConnect";
import Reviews from "./pages/Reviews";
import ReviewDetail from "./pages/ReviewDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner richColors position="top-right" />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/companies/new" element={<RequireAuth><NewCompany /></RequireAuth>} />
            <Route path="/companies/:companyId/settings" element={<RequireAuth><CompanySettings /></RequireAuth>} />
            <Route path="/companies/:companyId/zoho" element={<RequireAuth><ZohoConnect /></RequireAuth>} />
            <Route path="/companies/:companyId/reviews" element={<RequireAuth><Reviews /></RequireAuth>} />
            <Route path="/companies/:companyId/reviews/:reviewId" element={<RequireAuth><ReviewDetail /></RequireAuth>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
