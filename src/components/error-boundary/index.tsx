import { Box, Button, Heading, Text, VStack } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { Component } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error): void {
    console.error("Content error boundary caught:", error);
  }

  reset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  override render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <Box p={8}>
          <VStack align="stretch" gap={4}>
            <Heading size="md" color="red.fg">
              Something went wrong
            </Heading>
            <Text color="fg.muted" fontFamily="mono" fontSize="sm">
              {this.state.error.message}
            </Text>
            <Button size="sm" onClick={this.reset} alignSelf="start">
              Try again
            </Button>
          </VStack>
        </Box>
      );
    }
    return this.props.children;
  }
}
