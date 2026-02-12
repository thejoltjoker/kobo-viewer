import { Heading, Text } from "@chakra-ui/react";
import Dropzone from "@/components/dropzone";

export function OverviewPage() {
  return (
    <>
      <Heading size="xl" mb={4}>
        Welcome to the Kobo Reader
      </Heading>
      <Text mb={6}>Upload a Kobo database file to get started.</Text>
      <Dropzone />
    </>
  );
}
