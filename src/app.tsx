import { Route, Routes } from "react-router";

import "./app.css";
import { Layout } from "./components/layout";
import { DatabaseProvider } from "./lib/db/context";
import { BookmarksPage } from "./pages/bookmarks";
import { OverviewPage } from "./pages/overview";
import { WordlistPage } from "./pages/wordlist";

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
