import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

import { BrowserRouter, Route, Routes } from "react-router-dom";
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import Index from "./pages/Index";
import Mobile from './pages/Mobile';
import FireTV from './pages/FireTV';
import {FireTVApp1} from "@/components/firetv/FireTVApp1";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/mobile" element={<Mobile />} />
          <Route path="/firetv" element={<FireTV />} />
          <Route path="/firetv1" element={<FireTVApp1 />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
