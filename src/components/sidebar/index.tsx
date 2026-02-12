import { ColorModeButton } from "@/components/ui/color-mode";
import {
  Box,
  VStack,
  Text,
  Heading,
  IconButton,
  HStack,
  Button,
} from "@chakra-ui/react";
import {
  LuLayoutDashboard,
  LuBookOpen,
  LuBookmark,
  LuChevronLeft,
  LuChevronRight,
  LuTrash2,
} from "react-icons/lu";
import type { IconType } from "react-icons";
import { useDatabase } from "@/lib/db/hooks";
import { useState } from "react";
import { ClearDatabaseDialog } from "@/components/dialogs/clear-database-dialog";
import { NavLink } from "react-router";

export interface NavLinkConfig {
  id: string;
  label: string;
  icon: IconType;
  to: string;
}

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const navLinks: NavLinkConfig[] = [
  { id: "Overview", label: "Overview", icon: LuLayoutDashboard, to: "/" },
  { id: "Words", label: "Words", icon: LuBookOpen, to: "/wordlist" },
  { id: "Highlights", label: "Highlights", icon: LuBookmark, to: "/highlights" },
];

export function Sidebar({
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const sidebarWidth = isCollapsed ? "64px" : "240px";
  const { db } = useDatabase();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Box
      as="aside"
      width={sidebarWidth}
      height="100vh"
      bg="bg.subtle"
      borderRightWidth="1px"
      borderRightColor="border.emphasized"
      p={isCollapsed ? 2 : 4}
      position="fixed"
      left={0}
      top={0}
      transition="width 0.2s ease"
      overflow="hidden"
    >
      <VStack align="stretch" gap={6}>
        <HStack
          justify={isCollapsed ? "center" : "space-between"}
          align="center"
        >
          {!isCollapsed && <Heading size="lg">Kobo Reader</Heading>}
          <IconButton
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            size="sm"
            variant="ghost"
            onClick={onToggleCollapse}
          >
            {isCollapsed ? (
              <LuChevronRight size={16} />
            ) : (
              <LuChevronLeft size={16} />
            )}
          </IconButton>
        </HStack>
        <VStack align="stretch" gap={2}>
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink key={link.id} to={link.to} title={isCollapsed ? link.label : undefined}>
                {({ isActive }) => (
                  <Box
                    as="span"
                    px={isCollapsed ? 2 : 3}
                    py={2}
                    borderRadius="md"
                    bg={isActive ? "colorPalette.500" : "transparent"}
                    color={isActive ? "white" : "fg.default"}
                    _hover={{
                      bg: isActive ? "colorPalette.600" : "bg.emphasized",
                    }}
                    transition="all 0.2s"
                    cursor="pointer"
                    display="flex"
                    alignItems="center"
                    justifyContent={isCollapsed ? "center" : "flex-start"}
                    gap={isCollapsed ? 0 : 3}
                    textDecoration="none"
                  >
                    <Icon size={20} />
                    {!isCollapsed && (
                      <Text fontWeight={isActive ? "semibold" : "normal"}>
                        {link.label}
                      </Text>
                    )}
                  </Box>
                )}
              </NavLink>
            );
          })}
        </VStack>
        {db && (
          <>
            <Button
              variant="outline"
              colorScheme="red"
              size={isCollapsed ? "sm" : "md"}
              onClick={() => setIsDialogOpen(true)}
              justifyContent={isCollapsed ? "center" : "flex-start"}
              gap={isCollapsed ? 0 : 2}
              title={isCollapsed ? "Remove database" : undefined}
            >
              <LuTrash2 size={isCollapsed ? 16 : 18} />
              {!isCollapsed && <Text>Remove Database</Text>}
            </Button>
            <ClearDatabaseDialog
              isOpen={isDialogOpen}
              onOpenChange={setIsDialogOpen}
            />
          </>
        )}
        <ColorModeButton />
      </VStack>
    </Box>
  );
}

export function getSidebarWidth(isCollapsed: boolean): string {
  return isCollapsed ? "64px" : "240px";
}
