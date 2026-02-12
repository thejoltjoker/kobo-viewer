import { Routes, Route } from "react-router";
import "./App.css";
import { DatabaseProvider } from "./lib/db/context";
import { Layout } from "./components/layout";
import { OverviewPage } from "./pages/overview";
import { WordlistPage } from "./pages/wordlist";
import { HighlightsPage } from "./pages/highlights";

function App() {
  return (
    <DatabaseProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<OverviewPage />} />
          <Route path="wordlist" element={<WordlistPage />} />
          <Route path="highlights" element={<HighlightsPage />} />
        </Route>
      </Routes>
    </DatabaseProvider>
  );
}

export default App;
