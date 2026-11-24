import type { Arquivo } from '@/types/api';

/**
 * Extracts the parent folder path from a file's stored `caminho` (e.g. "docs/2026/tcc.pdf" -> "docs/2026").
 * Files stored in the root return "".
 */
export function getParentFolder(caminho: string): string {
  const normalized = caminho.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
  const lastSlash = normalized.lastIndexOf('/');
  if (lastSlash === -1) return '';
  return normalized.slice(0, lastSlash);
}

/**
 * Returns the immediate child folders and files inside `currentFolder`.
 */
export function getFolderContents(arquivos: Arquivo[], currentFolder: string): {
  subfolders: { name: string; fullPath: string; fileCount: number }[];
  files: Arquivo[];
} {
  const normalizedCurrent = currentFolder.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
  const prefix = normalizedCurrent ? `${normalizedCurrent}/` : '';

  const folderCounts = new Map<string, number>();
  const files: Arquivo[] = [];

  for (const arquivo of arquivos) {
    const parent = getParentFolder(arquivo.caminho);

    if (parent === normalizedCurrent) {
      files.push(arquivo);
      continue;
    }

    if (prefix === '' ? parent !== '' : parent.startsWith(prefix)) {
      const remainder = prefix ? parent.slice(prefix.length) : parent;
      const nextSegment = remainder.split('/')[0];
      if (nextSegment) {
        const childFullPath = normalizedCurrent ? `${normalizedCurrent}/${nextSegment}` : nextSegment;
        folderCounts.set(childFullPath, (folderCounts.get(childFullPath) ?? 0) + 1);
      }
    }
  }

  const subfolders = Array.from(folderCounts.entries())
    .map(([fullPath, fileCount]) => ({
      name: fullPath.split('/').pop() ?? fullPath,
      fullPath,
      fileCount,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  return { subfolders, files };
}

/**
 * Builds breadcrumb segments for a folder path (e.g. "a/b" -> [{ label: "a", path: "a" }, { label: "b", path: "a/b" }]).
 */
export function buildBreadcrumbs(folderPath: string): { label: string; path: string }[] {
  const normalized = folderPath.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
  if (!normalized) return [];
  const parts = normalized.split('/');
  return parts.map((part, index) => ({
    label: part,
    path: parts.slice(0, index + 1).join('/'),
  }));
}
