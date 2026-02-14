import { Box, FileUpload, Icon } from "@chakra-ui/react";
import * as React from "react";
import { LuUpload } from "react-icons/lu";

import { useDatabase } from "@/lib/db/hooks";

export interface DropzoneProps {}

const Dropzone: React.FC<DropzoneProps> = () => {
  const { initializeDatabase, db } = useDatabase();

  const handleFileAccept = async (details: { files: File[] }) => {
    const files = details.files;
    const file = files[0];
    if (file) {
      try {
        const buffer = await file.arrayBuffer();
        await initializeDatabase(buffer);
        if (db) {
          await db.query.wordList.findMany();
        }
      }
      catch (error) {
        console.error("Error processing file:", error);
      }
    }
    else {
      console.warn("No file found in files array");
    }
  };
  return (
    <FileUpload.Root
      width="100%"
      alignItems="stretch"
      maxFiles={1}
      onFileAccept={handleFileAccept}
    >
      <FileUpload.HiddenInput />
      <FileUpload.Dropzone>
        <Icon size="md" color="fg.muted">
          <LuUpload />
        </Icon>
        <FileUpload.DropzoneContent>
          <Box>Drag and drop database file here</Box>
          <Box color="fg.muted">.sqlite or .db up to 50MB</Box>
        </FileUpload.DropzoneContent>
      </FileUpload.Dropzone>
      <FileUpload.List />
    </FileUpload.Root>
  );
};

export default Dropzone;
