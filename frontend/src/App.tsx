import { Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { SearchResults } from "./pages/SearchResults";
import { Upload } from "./pages/Upload";
import { NotFound } from "./pages/NotFound";

function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;