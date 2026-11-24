import { describe, expect, it } from 'vitest';
import {
  formatBytes,
  getFileExtension,
  getPreviewKind,
  isValidFilename,
  normalizeFolderPath,
} from './format';

describe('format utils', () => {
  it('formats bytes cleanly', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1024)).toBe('1.0 KB');
    expect(formatBytes(1024 * 1024 * 2.5)).toBe('2.5 MB');
  });

  it('detects file extensions and preview kinds', () => {
    expect(getFileExtension('relatorio.PDF')).toBe('pdf');
    expect(getFileExtension('sem-extensao')).toBe('');
    expect(getPreviewKind('foto.png')).toBe('image');
    expect(getPreviewKind('tcc.pdf')).toBe('pdf');
    expect(getPreviewKind('notas.md')).toBe('text');
    expect(getPreviewKind('arquivo.zip')).toBe('unsupported');
  });

  it('validates filenames against slashes and dots', () => {
    expect(isValidFilename('documento.pdf')).toBe(true);
    expect(isValidFilename('pasta/documento.pdf')).toBe(false);
    expect(isValidFilename('pasta\\documento.pdf')).toBe(false);
    expect(isValidFilename('..')).toBe(false);
    expect(isValidFilename('   ')).toBe(false);
  });

  it('normalizes folder paths', () => {
    expect(normalizeFolderPath(' /docs\\2026//tcc/ ')).toBe('docs/2026/tcc');
    expect(normalizeFolderPath('   ')).toBe('');
  });
});
