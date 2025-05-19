
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Feed from "./pages/Feed";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ArticleDetail from "./pages/ArticleDetail";
import Profile from "./pages/Profile";
import NewsLayout from "./components/NewsLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<NewsLayout><Feed /></NewsLayout>} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/home" element={<Index />} />
        <Route path="/article/:id" element={<NewsLayout><ArticleDetail /></NewsLayout>} />
        <Route path="/profile" element={<NewsLayout><Profile /></NewsLayout>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
