import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/audiences" element={<div className="p-6"><h1 className="text-2xl font-bold">Audiences - Coming Soon</h1></div>} />
            <Route path="/analytics" element={<div className="p-6"><h1 className="text-2xl font-bold">Analytics - Coming Soon</h1></div>} />
            <Route path="/industries" element={<Industries />} />
            <Route path="/cities" element={<Cities />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/job-levels" element={<JobLevels />} />
            <Route path="/comp-turnovers" element={<CompTurnovers />} />
            <Route path="/emp-ranges" element={<EmpRanges />} />
            <Route path="/settings" element={<div className="p-6"><h1 className="text-2xl font-bold">Settings - Coming Soon</h1></div>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
