import { Button, Dialog, Text } from "@chakra-ui/react";
import { useDatabase } from "@/lib/db/hooks";

interface ClearDatabaseDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClearDatabaseDialog({
  isOpen,
  onOpenChange,
}: ClearDatabaseDialogProps) {
  const { clearDatabase } = useDatabase();

  const handleClearDatabase = async () => {
    try {
      await clearDatabase();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to clear database:", error);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => onOpenChange(e.open)}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.CloseTrigger />
          <Dialog.Header>
            <Dialog.Title>Remove Database</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <Text>
              Are you sure you want to remove the saved database? This action
              cannot be undone.
            </Text>
          </Dialog.Body>
          <Dialog.Footer>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleClearDatabase}>
              Remove
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
