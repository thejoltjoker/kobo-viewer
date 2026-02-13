import { Box } from "@chakra-ui/react";
import { Outlet } from "react-router";
import { Sidebar, getSidebarWidth } from "@/components/sidebar";
import { useState } from "react";

export function Layout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidth = getSidebarWidth(isCollapsed);

  return (
    <Box bg="bg.subtle" height="100vh">
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />
      <Box
        p={2}
        ml={sidebarWidth}
        transition="margin-left 0.2s ease"
        bg="bg.subtle"
      >
        <Box
          as="main"
          borderRadius={8}
          border="1px solid"
          borderColor="border.muted"
          bg="bg.panel"
          p={8}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
