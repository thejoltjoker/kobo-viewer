import { Routes, Route } from "react-router";
import "./App.css";
import { DatabaseProvider } from "./lib/db/context";
import { Layout } from "./components/layout";
import { OverviewPage } from "./pages/overview";
import { WordlistPage } from "./pages/wordlist";
import { BookmarksPage } from "./pages/bookmarks";

function App() {
  return (
    <DatabaseProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<OverviewPage />} />
          <Route path="wordlist" element={<WordlistPage />} />
          <Route path="bookmarks" element={<BookmarksPage />} />
        </Route>
      </Routes>
    </DatabaseProvider>
  );
}

export default App;
