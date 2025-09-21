import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Contacts from "./pages/Contacts";
import Companies from "./pages/Companies";
import Industries from "./pages/Industries";
import Cities from "./pages/Cities";
import Departments from "./pages/Departments";
import JobLevels from "./pages/JobLevels";
import CompTurnovers from "./pages/CompTurnovers";
import EmpRanges from "./pages/EmpRanges";
import Campaigns from "./pages/Campaigns";
import Audiences from "./pages/Audiences";
import Users from "./pages/Users";
import ResetPassword from "./pages/ResetPassword";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth route - no protection needed */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected routes */}
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/contacts" element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
            <Route path="/companies" element={<ProtectedRoute><Companies /></ProtectedRoute>} />
            <Route path="/campaigns" element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />
            <Route path="/audiences" element={<ProtectedRoute><Audiences /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><div className="p-6"><h1 className="text-2xl font-bold">Analytics - Coming Soon</h1></div></ProtectedRoute>} />
            <Route path="/industries" element={<ProtectedRoute><Industries /></ProtectedRoute>} />
            <Route path="/cities" element={<ProtectedRoute><Cities /></ProtectedRoute>} />
            <Route path="/departments" element={<ProtectedRoute><Departments /></ProtectedRoute>} />
            <Route path="/job-levels" element={<ProtectedRoute><JobLevels /></ProtectedRoute>} />
            <Route path="/comp-turnovers" element={<ProtectedRoute><CompTurnovers /></ProtectedRoute>} />
            <Route path="/emp-ranges" element={<ProtectedRoute><EmpRanges /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/settings" element={<ProtectedRoute><div className="p-6"><h1 className="text-2xl font-bold">Settings - Coming Soon</h1></div></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
