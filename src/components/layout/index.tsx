import { Box } from "@chakra-ui/react";
import { Outlet } from "react-router";
import { Sidebar, getSidebarWidth } from "@/components/sidebar";
import { useState } from "react";

export function Layout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidth = getSidebarWidth(isCollapsed);

  return (
    <>
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />
      <Box as="main" ml={sidebarWidth} p={8} transition="margin-left 0.2s ease">
        <Outlet />
      </Box>
    </>
  );
}
