import React, { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeProvider } from "next-themes";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import Index from "./pages/Index";
import Upload from "./pages/Upload";
import Flashcards from "./pages/Flashcards";
import Quiz from "./pages/Quiz";
import QuestionPaper from "./pages/QuestionPaper";
import Mindmap from "./pages/Mindmap";
import Podcast from "./pages/Podcast";
import Summary from "./pages/Summary";
import Auth from "./pages/Auth";
import AboutUs from "./pages/AboutUs";
import AccountDetails from "./pages/AccountDetails";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const AuthLayout = () => {
    if (session) {
      return <Navigate to="/" replace />;
    }
    return <Auth />;
  };
  
  const MainLayout = () => {
    if (!session) {
      return <Navigate to="/auth" replace />;
    }

    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <main className="flex-1 overflow-auto h-screen">
            <Routes>
              <Route path="/" element={<Upload />} />
              <Route path="/chat" element={<Index />} />
              <Route path="/flashcards" element={<Flashcards />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/question-paper" element={<QuestionPaper />} />
              <Route path="/mindmap" element={<Mindmap />} />
              <Route path="/podcast" element={<Podcast />} />
              <Route path="/summary" element={<Summary />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/account" element={<AccountDetails />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </SidebarProvider>
    );
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthLayout />} />
            <Route path="/*" element={<MainLayout />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
