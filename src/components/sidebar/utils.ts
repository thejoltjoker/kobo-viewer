export const getSidebarWidth = (isCollapsed: boolean): string => {
  return isCollapsed ? "64px" : "240px";
};

export function formatDatabaseSize(bytes: number): string {
  if (bytes < 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
