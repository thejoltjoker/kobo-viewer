import { useState } from "react";
import { Box, Heading, Text } from "@chakra-ui/react";
import { Sidebar, getSidebarWidth } from "@/components/sidebar";
import "./App.css";
import Dropzone from "@/components/dropzone";
import WordlistTable from "./components/wordlist";
import type { Wordlist } from "./lib/db/types";

function App() {
  const [activeLink, setActiveLink] = useState("Overview");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [wordlist, setWordlist] = useState<Wordlist[]>([]);
  const sidebarWidth = getSidebarWidth(isCollapsed);

  return (
    <>
      <Sidebar
        activeLink={activeLink}
        onLinkClick={setActiveLink}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />
      <Box as="main" ml={sidebarWidth} p={8} transition="margin-left 0.2s ease">
        <Heading size="xl" mb={4}>
          Welcome to the Kobo Reader
        </Heading>
        <Text>Current page: {activeLink}</Text>
        <WordlistTable wordlist={[]} />
        <Dropzone />
      </Box>
    </>
  );
}

export default App;
