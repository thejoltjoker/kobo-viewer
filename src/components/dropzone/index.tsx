import { Box, FileUpload, Icon, Spinner, Stack, Text } from "@chakra-ui/react";
import * as React from "react";
import { useRef, useState } from "react";
import { LuUpload } from "react-icons/lu";

import { useDatabase } from "@/lib/db/hooks";

export interface DropzoneProps {}

const Dropzone: React.FC<DropzoneProps> = () => {
  const { initializeDatabase, db } = useDatabase();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileAccept = async (details: { files: File[] }) => {
    const files = details.files;
    const file = files[0];
    if (file) {
      try {
        setIsUploading(true);
        const buffer = await file.arrayBuffer();
        await initializeDatabase(buffer);
        if (db) {
          await db.query.wordList.findMany();
        }
      } catch (error) {
        console.error("Error processing file:", error);
      } finally {
        setIsUploading(false);
      }
    } else {
      console.warn("No file found in files array");
    }
  };

  const handleDropzoneClick = async () => {
    // Try to use File System Access API if available (Chrome/Edge)
    // Note: Browsers don't allow setting a default directory for security reasons,
    // but the file picker will remember the last location the user visited
    if (
      "showOpenFilePicker" in window &&
      typeof (window as any).showOpenFilePicker === "function"
    ) {
      try {
        const fileHandles = await (window as any).showOpenFilePicker({
          types: [
            {
              description: "Kobo Database Files",
              accept: {
                "application/x-sqlite3": [".sqlite", ".db"],
                "application/vnd.sqlite3": [".sqlite", ".db"],
              },
            },
          ],
          excludeAcceptAllOption: false,
          multiple: false,
        });

        if (fileHandles && fileHandles.length > 0) {
          const file = await fileHandles[0].getFile();
          await handleFileAccept({ files: [file] });
        }
        return;
      } catch (error: any) {
        // User cancelled or API not fully supported, fall back to standard input
        if (error.name !== "AbortError" && error.name !== "NotAllowedError") {
          console.error("Error with File System Access API:", error);
        }
      }
    }

    // Fall back to standard file input
    // Trigger the hidden input click
    fileInputRef.current?.click();
  };

  return (
    <FileUpload.Root
      width="100%"
      alignItems="stretch"
      maxFiles={1}
      onFileAccept={handleFileAccept}
    >
      <FileUpload.HiddenInput ref={fileInputRef} />
      <FileUpload.Dropzone onClick={handleDropzoneClick} cursor="pointer">
        {isUploading ? (
          <Stack align="center" gap={3}>
            <Spinner size="lg" colorPalette="blue" />
            <Text color="fg.muted">Processing database…</Text>
          </Stack>
        ) : (
          <>
            <Icon size="md" color="fg.muted">
              <LuUpload />
            </Icon>
            <FileUpload.DropzoneContent>
              <Box>Click or drag and drop database file here</Box>
              <Box color="fg.muted">.sqlite or .db up to 50MB</Box>
            </FileUpload.DropzoneContent>
          </>
        )}
      </FileUpload.Dropzone>
      <FileUpload.List />
    </FileUpload.Root>
  );
};

export default Dropzone;
