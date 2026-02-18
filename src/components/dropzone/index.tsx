import { Box, FileUpload, Icon, Spinner, Stack, Text } from "@chakra-ui/react";
import * as React from "react";
import { useRef, useState } from "react";
import { LuUpload } from "react-icons/lu";

import { useDatabase } from "@/lib/db/hooks";

export interface DropzoneProps {}

// Note: Browser security restrictions prevent setting arbitrary default file paths.
// Typical KoboReader.sqlite locations:
// - Windows: D:\.kobo\KoboReader.sqlite (or E:\, F:\, etc. depending on drive letter)
// - macOS: /Volumes/KOBOeReader/.kobo/KoboReader.sqlite
// The file picker will remember the last directory the user visited, and we also
// store the last directory handle in IndexedDB to use as a starting point.

const Dropzone: React.FC<DropzoneProps> = () => {
  const { initializeDatabase, db } = useDatabase();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isHandlingFileRef = useRef(false);

  const handleFileAccept = async (details: { files: File[] }) => {
    // Prevent double-processing if we're already handling a file
    if (isHandlingFileRef.current) {
      return;
    }

    const files = details.files;
    const file = files[0];
    if (file) {
      try {
        isHandlingFileRef.current = true;
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
        isHandlingFileRef.current = false;
      }
    } else {
      console.warn("No file found in files array");
    }
  };

  const handleDropzoneClick = async (event?: React.MouseEvent) => {
    // Prevent the default FileUpload behavior
    event?.preventDefault();
    event?.stopPropagation();
    event?.nativeEvent.stopImmediatePropagation();

    // Don't open file picker if we're already processing a file
    if (isHandlingFileRef.current || isUploading) {
      return;
    }

    // Try to use File System Access API if available (Chrome/Edge)
    if (
      "showOpenFilePicker" in window &&
      typeof (window as any).showOpenFilePicker === "function"
    ) {
      try {
        // Try to get the last directory handle from IndexedDB
        let startInHandle: FileSystemDirectoryHandle | undefined;

        try {
          const db = await new Promise<IDBDatabase>((resolve, reject) => {
            const request = indexedDB.open(
              "kobo-companion-directory-handle",
              1
            );
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            request.onupgradeneeded = (event) => {
              const db = (event.target as IDBOpenDBRequest).result;
              if (!db.objectStoreNames.contains("handles")) {
                db.createObjectStore("handles");
              }
            };
          });

          const transaction = db.transaction("handles", "readonly");
          const store = transaction.objectStore("handles");
          const request = store.get("last-directory");

          await new Promise<void>((resolve, reject) => {
            request.onsuccess = () => {
              if (request.result) {
                startInHandle = request.result as FileSystemDirectoryHandle;
              }
              resolve();
            };
            request.onerror = () => reject(request.error);
          });

          db.close();
        } catch (error) {
          // IndexedDB access failed, continue without startIn
          console.debug("Could not retrieve last directory handle:", error);
        }

        const pickerOptions: any = {
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
        };

        // Use the last directory as starting point if available
        if (startInHandle) {
          pickerOptions.startIn = startInHandle;
        }

        const fileHandles = await (window as any).showOpenFilePicker(
          pickerOptions
        );

        if (fileHandles && fileHandles.length > 0) {
          const fileHandle = fileHandles[0];
          const file = await fileHandle.getFile();

          // Save the directory handle for next time
          try {
            // Get the directory handle from the file handle
            const directoryHandle = await fileHandle.getParent();

            const db = await new Promise<IDBDatabase>((resolve, reject) => {
              const request = indexedDB.open(
                "kobo-companion-directory-handle",
                1
              );
              request.onerror = () => reject(request.error);
              request.onsuccess = () => resolve(request.result);
              request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains("handles")) {
                  db.createObjectStore("handles");
                }
              };
            });

            const transaction = db.transaction("handles", "readwrite");
            const store = transaction.objectStore("handles");
            await new Promise<void>((resolve, reject) => {
              const request = store.put(directoryHandle, "last-directory");
              request.onsuccess = () => resolve();
              request.onerror = () => reject(request.error);
            });

            db.close();
          } catch (error) {
            // Failed to save directory handle, continue anyway
            console.debug("Could not save directory handle:", error);
          }

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
    // Note: Standard file inputs cannot set a default directory due to browser security restrictions
    // The browser will remember the last location the user visited
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
      <FileUpload.Dropzone
        onClick={(event) => {
          // Completely prevent FileUpload's default click handling
          event.preventDefault();
          event.stopPropagation();
          event.nativeEvent.stopImmediatePropagation();
          handleDropzoneClick(event);
        }}
        onPointerDown={(event) => {
          // Also prevent pointer events from triggering FileUpload
          event.preventDefault();
          event.stopPropagation();
          event.nativeEvent.stopImmediatePropagation();
        }}
        cursor="pointer"
      >
        <Stack
          align="center"
          justify="center"
          gap="3"
          onClick={(event) => {
            // Prevent clicks on the content from bubbling
            event.stopPropagation();
          }}
          width="100%"
          height="100%"
        >
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
        </Stack>
      </FileUpload.Dropzone>
      <FileUpload.List />
    </FileUpload.Root>
  );
};

export default Dropzone;
