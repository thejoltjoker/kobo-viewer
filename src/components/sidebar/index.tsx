import { ColorModeButton } from "@/components/ui/color-mode";
import {
  Box,
  VStack,
  Link,
  Text,
  Heading,
  IconButton,
  HStack,
} from "@chakra-ui/react";
import {
  LuLayoutDashboard,
  LuBookOpen,
  LuBookmark,
  LuChevronLeft,
  LuChevronRight,
} from "react-icons/lu";
import type { IconType } from "react-icons";

export interface NavLink {
  id: string;
  label: string;
  icon: IconType;
}

interface SidebarProps {
  activeLink: string;
  onLinkClick: (linkId: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const navLinks: NavLink[] = [
  { id: "Overview", label: "Overview", icon: LuLayoutDashboard },
  { id: "Words", label: "Words", icon: LuBookOpen },
  { id: "Highlights", label: "Highlights", icon: LuBookmark },
];

export function Sidebar({
  activeLink,
  onLinkClick,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const sidebarWidth = isCollapsed ? "64px" : "240px";

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
            const isActive = activeLink === link.id;
            return (
              <Link
                key={link.id}
                onClick={() => onLinkClick(link.id)}
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
                textDecoration="none"
                display="flex"
                alignItems="center"
                justifyContent={isCollapsed ? "center" : "flex-start"}
                gap={isCollapsed ? 0 : 3}
                title={isCollapsed ? link.label : undefined}
              >
                <Icon size={20} />
                {!isCollapsed && (
                  <Text fontWeight={isActive ? "semibold" : "normal"}>
                    {link.label}
                  </Text>
                )}
              </Link>
            );
          })}
        </VStack>
        <ColorModeButton />
      </VStack>
    </Box>
  );
}

export function getSidebarWidth(isCollapsed: boolean): string {
  return isCollapsed ? "64px" : "240px";
}
