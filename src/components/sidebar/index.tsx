import { ColorModeIcon, useColorMode } from "@/components/ui/color-mode";
import {
  Box,
  VStack,
  Text,
  Heading,
  IconButton,
  HStack,
  Button,
  Card,
  DataList,
  Badge,
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
import { useState, useEffect } from "react";
import { ClearDatabaseDialog } from "@/components/dialogs/clear-database-dialog";
import { NavLink } from "react-router";
import { getBookmarksCount, getWordlistCount } from "@/lib/db/queries";

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
  {
    id: "Bookmarks",
    label: "Bookmarks",
    icon: LuBookmark,
    to: "/bookmarks",
  },
];

export function Sidebar({ isCollapsed, onToggleCollapse }: SidebarProps) {
  const sidebarWidth = isCollapsed ? "64px" : "240px";
  const { db, lastUploaded } = useDatabase();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toggleColorMode, colorMode } = useColorMode();
  const [wordCount, setWordCount] = useState<number | null>(null);
  const [bookmarkCount, setBookmarkCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchWordCount() {
      if (!db) {
        setWordCount(null);
        setBookmarkCount(null);
        return;
      }

      try {
        const wordCountData = await getWordlistCount(db);
        setWordCount(wordCountData);
        const bookmarkCountData = await getBookmarksCount(db);
        setBookmarkCount(bookmarkCountData);
      } catch (err) {
        console.error("Error fetching word count:", err);
        setWordCount(null);
        setBookmarkCount(null);
      }
    }

    fetchWordCount();
  }, [db]);

  return (
    <Box
      bg="bg.subtle"
      as="aside"
      width={sidebarWidth}
      height="100vh"
      p={isCollapsed ? 2 : 4}
      pr={2}
      position="fixed"
      left={0}
      top={0}
      transition="width 0.2s ease"
      overflow="hidden"
    >
      <VStack align="stretch" justify="center" height="100%" gap={6}>
        <HStack
          justify={isCollapsed ? "center" : "space-between"}
          align="center"
        >
          {!isCollapsed && <Heading size="lg">Kobo Companion</Heading>}
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
        <VStack align="stretch" height="100%" gap={2}>
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.id}
                to={link.to}
                title={isCollapsed ? link.label : undefined}
              >
                {({ isActive }) => (
                  <Box
                    as="span"
                    px={isCollapsed ? 2 : 3}
                    py={2}
                    borderRadius="md"
                    bg={isActive ? "colorPalette.700" : "transparent"}
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
                      <HStack gap={2} flex={1} justify="space-between">
                        <Text fontWeight={isActive ? "semibold" : "normal"}>
                          {link.label}
                        </Text>
                        {link.id === "Words" && wordCount !== null && (
                          <Badge
                            colorScheme={isActive ? "white" : "gray"}
                            bg={isActive ? "whiteAlpha.300" : "bg.emphasized"}
                            color={isActive ? "white" : "fg.muted"}
                          >
                            {wordCount}
                          </Badge>
                        )}
                        {link.id === "Bookmarks" && bookmarkCount !== null && (
                          <Badge
                            colorScheme={isActive ? "white" : "gray"}
                            bg={isActive ? "whiteAlpha.300" : "bg.emphasized"}
                            color={isActive ? "white" : "fg.muted"}
                          >
                            {bookmarkCount}
                          </Badge>
                        )}
                      </HStack>
                    )}
                  </Box>
                )}
              </NavLink>
            );
          })}
        </VStack>
        {db && (
          <>
            {isCollapsed ? (
              <IconButton
                aria-label="Remove database"
                variant="ghost"
                colorScheme="red"
                size="sm"
                onClick={() => setIsDialogOpen(true)}
                title="Remove database"
              >
                <LuTrash2 size={16} />
              </IconButton>
            ) : (
              <Card.Root size="sm">
                <Card.Header>
                  <Heading size="md">Database</Heading>
                </Card.Header>
                <Card.Body color="fg.muted">
                  <DataList.Root size="md">
                    <DataList.Item>
                      <DataList.ItemLabel>Last uploaded</DataList.ItemLabel>
                      <DataList.ItemValue>
                        {lastUploaded?.toLocaleDateString()}
                      </DataList.ItemValue>
                    </DataList.Item>
                  </DataList.Root>
                  <Button
                    size="sm"
                    onClick={() => setIsDialogOpen(true)}
                    gap={2}
                  >
                    <LuTrash2 size={18} />
                    <Text>Remove Database</Text>
                  </Button>
                </Card.Body>
              </Card.Root>
            )}
            <ClearDatabaseDialog
              isOpen={isDialogOpen}
              onOpenChange={setIsDialogOpen}
            />
          </>
        )}
        <Box
          as="button"
          px={isCollapsed ? 2 : 3}
          py={2}
          borderRadius="md"
          bg="transparent"
          color="fg.default"
          _hover={{
            bg: "bg.emphasized",
          }}
          transition="all 0.2s"
          cursor="pointer"
          display="flex"
          alignItems="center"
          justifyContent={isCollapsed ? "center" : "flex-start"}
          gap={isCollapsed ? 0 : 3}
          onClick={toggleColorMode}
          title={isCollapsed ? "Toggle Theme" : undefined}
        >
          <Box display="flex" alignItems="center" fontSize="20px">
            <ColorModeIcon />
          </Box>
          {!isCollapsed && (
            <Text fontWeight="normal">
              {colorMode === "dark" ? "Light Mode" : "Dark Mode"}
            </Text>
          )}
        </Box>
      </VStack>
    </Box>
  );
}

export function getSidebarWidth(isCollapsed: boolean): string {
  return isCollapsed ? "64px" : "240px";
}
