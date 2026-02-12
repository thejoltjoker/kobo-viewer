import { Box, FileUpload, Icon } from "@chakra-ui/react";
import { LuUpload } from "react-icons/lu";
import React from "react";
import { createDrizzleDb, initDatabase } from "@/lib/db";

export interface DropzoneProps {}

const Dropzone: React.FC<DropzoneProps> = ({}) => {
  const handleFileAccept = async (details: { files: File[] }) => {
    console.log("File accepted:", details);
    const files = details.files;
    console.log("Files array length:", files.length);
    const file = files[0];
    console.log("First file:", file);
    if (file) {
      try {
        console.log("Processing file:", file.name, "size:", file.size);
        const buffer = await file.arrayBuffer();
        console.log("Buffer created, size:", buffer.byteLength);
        const database = await initDatabase(buffer);
        console.log("Database initialized");
        const db = createDrizzleDb(database);
        console.log("Drizzle DB created");
        const res = await db.query.wordList.findMany();
        console.log("Query result:", res);
      } catch (error) {
        console.error("Error processing file:", error);
      }
    } else {
      console.warn("No file found in files array");
    }
  };
  return (
    <FileUpload.Root
      maxW="xl"
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
