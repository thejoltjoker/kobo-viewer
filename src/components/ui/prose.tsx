import type { BoxProps } from "@chakra-ui/react";

import { Box } from "@chakra-ui/react";

export interface ProseProps extends BoxProps {
  size?: "sm" | "md" | "lg";
}

/**
 * Wrapper for remote HTML content (e.g. from Wiktionary).
 * Styles links, emphasis, and typography to match the design system.
 * @see https://www.chakra-ui.com/docs/components/prose
 */
export function Prose({ size = "md", children, ...rest }: ProseProps) {
  const sizeMap = {
    sm: { fontSize: "xs", lineHeight: "1.5" },
    md: { fontSize: "sm", lineHeight: "tall" },
    lg: { fontSize: "md", lineHeight: "tall" },
  };
  const s = sizeMap[size];

  return (
    <Box
      className="chakra-prose"
      fontSize={s.fontSize}
      lineHeight={s.lineHeight}
      css={{
        "& a": {
          color: "var(--chakra-colors-blue-500)",
          textDecoration: "underline",
          _hover: { textDecoration: "underline" },
        },
        "& p": { marginBlock: "0.25em 0.5em" },
        "& p:first-of-type": { marginBlockStart: 0 },
        "& strong": { fontWeight: "semibold" },
        "& em": { fontStyle: "italic" },
        "& code": {
          fontSize: "0.9em",
          px: "0.2em",
          borderRadius: "sm",
          bg: "bg.muted",
          fontFamily: "mono",
        },
        "& ul, & ol": { paddingInlineStart: "1.25em", marginBlock: "0.5em" },
        "& li": { marginBlock: "0.25em" },
      }}
      {...rest}
    >
      {children}
    </Box>
  );
}
