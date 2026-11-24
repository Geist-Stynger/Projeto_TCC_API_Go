import { useEffect, useState } from 'react';
import { CircleNotch, DownloadSimple, File as FileIcon } from '@phosphor-icons/react';
import { toast } from 'sonner';
import type { Arquivo } from '@/types/api';
import { arquivosApi } from '@/api/arquivos.api';
import { getApiErrorMessage } from '@/api/client';
import { formatBytes, formatDateTime, getPreviewKind } from '@/utils/format';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface FilePreviewModalProps {
  arquivo: Arquivo | null;
  categoryName?: string;
  onClose: () => void;
  onDownload: (arquivo: Arquivo) => void;
}

export function FilePreviewModal({
  arquivo,
  categoryName,
  onClose,
  onDownload,
}: FilePreviewModalProps) {
  const [loading, setLoading] = useState(false);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const previewKind = arquivo ? getPreviewKind(arquivo.nome) : 'unsupported';

  useEffect(() => {
    if (!arquivo) return;
    let active = true;
    let createdUrl: string | null = null;

    setObjectUrl(null);
    setTextContent(null);
    setErrorMsg(null);

    if (previewKind === 'unsupported') {
      return;
    }

    setLoading(true);
    arquivosApi
      .fetchBlob(arquivo.id_arquivo, true)
      .then(async (blob) => {
        if (!active) return;
        if (previewKind === 'text') {
          const text = await blob.text();
          if (active) setTextContent(text);
        } else {
          createdUrl = URL.createObjectURL(blob);
          setObjectUrl(createdUrl);
        }
      })
      .catch((err) => {
        if (!active) return;
        const msg = getApiErrorMessage(err, 'Não foi possível carregar a pré-visualização.');
        setErrorMsg(msg);
        toast.error(msg);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [arquivo, previewKind]);

  return (
    <Modal
      open={Boolean(arquivo)}
      onClose={onClose}
      title={arquivo?.nome ?? 'Pré-visualização'}
      description={
        arquivo
          ? `${formatBytes(arquivo.tamanho)} • ${categoryName ?? `Categoria #${arquivo.categoria_id}`} • Atualizado em ${formatDateTime(arquivo.data_alteracao)}`
          : undefined
      }
      size="xl"
    >
      {arquivo && (
        <div className="space-y-4">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-subtle)]/50 p-4 min-h-[280px] flex items-center justify-center overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
                <CircleNotch size={28} className="animate-spin text-[var(--color-primary)]" />
                <span>Carregando pré-visualização...</span>
              </div>
            ) : errorMsg ? (
              <p className="text-sm text-[var(--color-destructive)]">{errorMsg}</p>
            ) : previewKind === 'image' && objectUrl ? (
              <img
                src={objectUrl}
                alt={arquivo.nome}
                className="max-h-[60vh] max-w-full rounded-lg object-contain"
              />
            ) : previewKind === 'pdf' && objectUrl ? (
              <iframe
                src={objectUrl}
                title={arquivo.nome}
                className="h-[60vh] w-full rounded-lg border border-[var(--color-border)] bg-white"
              />
            ) : previewKind === 'text' && textContent !== null ? (
              <pre className="max-h-[60vh] w-full overflow-auto rounded-lg bg-[var(--color-surface)] p-4 font-mono text-xs leading-relaxed text-[var(--color-foreground)] border border-[var(--color-border)] whitespace-pre-wrap break-words">
                {textContent}
              </pre>
            ) : (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <FileIcon size={36} weight="duotone" className="text-[var(--color-muted-foreground)]" />
                <p className="text-sm font-medium text-[var(--color-foreground)]">
                  Pré-visualização não suportada para este tipo de arquivo
                </p>
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  Faça o download para abrir no aplicativo padrão do seu sistema.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-[var(--color-border)] pt-3">
            <div className="text-xs text-[var(--color-muted-foreground)] space-y-0.5">
              <p>
                <span className="font-semibold text-[var(--color-foreground)]">Descrição:</span>{' '}
                {arquivo.descricao}
              </p>
              <p className="font-mono">
                <span className="font-sans font-semibold text-[var(--color-foreground)]">
                  Caminho:
                </span>{' '}
                /{arquivo.caminho}
              </p>
            </div>
            <Button onClick={() => onDownload(arquivo)}>
              <DownloadSimple size={16} weight="bold" aria-hidden="true" />
              Baixar arquivo
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
