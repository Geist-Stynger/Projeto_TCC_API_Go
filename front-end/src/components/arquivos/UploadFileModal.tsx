import { useEffect, useRef, useState, type DragEvent } from 'react';
import { CloudArrowUp, File as FileIcon, Plus, X } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useCategorias } from '@/hooks/useCategorias';
import { useUploadArquivo } from '@/hooks/useArquivos';
import { getApiErrorMessage } from '@/api/client';
import { formatBytes, isValidFilename, normalizeFolderPath } from '@/utils/format';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CategoryFormModal } from '@/components/categorias/CategoryFormModal';

const MAX_UPLOAD_MB = Number(import.meta.env.VITE_MAX_UPLOAD_MB) || 500;
const MAX_FILE_SIZE_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

interface UploadFileModalProps {
  open: boolean;
  onClose: () => void;
  defaultFolder?: string;
}

export function UploadFileModal({ open, onClose, defaultFolder = '' }: UploadFileModalProps) {
  const { data: categorias = [] } = useCategorias();
  const uploadMutation = useUploadArquivo();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [nome, setNome] = useState('');
  const [caminho, setCaminho] = useState(defaultFolder);
  const [descricao, setDescricao] = useState('');
  const [categoriaId, setCategoriaId] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedFile(null);
      setNome('');
      setCaminho(defaultFolder);
      setDescricao('');
      setProgress(0);
      setFormError(null);
      setCategoriaId(categorias[0] ? String(categorias[0].id) : '');
    }
  }, [open, defaultFolder, categorias]);

  const handleFilePicked = (file: File | null) => {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFormError(`O arquivo excede o limite de ${MAX_UPLOAD_MB} MB permitido pelo servidor.`);
      return;
    }
    setFormError(null);
    setSelectedFile(file);
    if (!nome.trim()) {
      setNome(file.name);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0] ?? null;
    handleFilePicked(file);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!selectedFile) {
      setFormError('Selecione um arquivo para enviar.');
      return;
    }
    if (!isValidFilename(nome)) {
      setFormError('Nome de arquivo inválido. Não utilize barras (/ ou \\).');
      return;
    }
    if (!descricao.trim()) {
      setFormError('Informe uma descrição para o arquivo.');
      return;
    }
    const parsedCat = Number(categoriaId);
    if (!parsedCat || parsedCat <= 0) {
      setFormError('Selecione ou crie uma categoria antes de enviar.');
      return;
    }

    try {
      await uploadMutation.mutateAsync({
        payload: {
          arquivo: selectedFile,
          nome: nome.trim(),
          caminho: normalizeFolderPath(caminho),
          descricao: descricao.trim(),
          categoria_id: parsedCat,
        },
        onProgress: setProgress,
      });
      toast.success(`Arquivo "${nome.trim()}" enviado com sucesso!`);
      onClose();
    } catch (error) {
      const msg = getApiErrorMessage(error, 'Erro ao enviar arquivo.');
      setFormError(msg);
      toast.error(msg);
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Enviar Arquivo"
        description={`Faça upload de um arquivo para o armazenamento interno (máximo ${MAX_UPLOAD_MB} MB).`}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {formError && (
            <div
              role="alert"
              className="rounded-lg border border-[var(--color-destructive)]/30 bg-[var(--color-destructive)]/10 px-3.5 py-2.5 text-xs text-[var(--color-destructive)]"
            >
              {formError}
            </div>
          )}

          {/* Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`rounded-xl border-2 border-dashed p-5 text-center transition-colors ${
              isDragging
                ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                : 'border-[var(--color-border)] bg-[var(--color-surface-subtle)]/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="sr-only"
              onChange={(e) => handleFilePicked(e.target.files?.[0] ?? null)}
            />
            {selectedFile ? (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-left">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                    <FileIcon size={20} weight="duotone" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--color-foreground)]">
                      {selectedFile.name}
                    </p>
                    <p className="font-mono text-xs text-[var(--color-muted-foreground)]">
                      {formatBytes(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remover arquivo selecionado"
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                >
                  <X size={16} aria-hidden="true" />
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <CloudArrowUp
                  size={32}
                  weight="duotone"
                  className="mx-auto text-[var(--color-primary)]"
                  aria-hidden="true"
                />
                <p className="text-sm font-medium text-[var(--color-foreground)]">
                  Arraste e solte o arquivo aqui
                </p>
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  ou clique no botão abaixo para selecionar do dispositivo
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Selecionar arquivo
                </Button>
              </div>
            )}
          </div>

          <Input
            label="Nome do arquivo"
            placeholder="Ex.: relatorio-tcc.pdf"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            hint="Inclua a extensão desejada (ex.: .pdf, .png, .txt). Não use barras."
          />

          <Input
            label="Pasta de destino (opcional)"
            placeholder="Ex.: documentos/2026"
            value={caminho}
            onChange={(e) => setCaminho(e.target.value)}
            hint="Deixe vazio para salvar na raiz do armazenamento."
          />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="upload-categoria"
                className="block text-sm font-medium text-[var(--color-foreground)]"
              >
                Categoria
              </label>
              <button
                type="button"
                onClick={() => setCategoryModalOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-primary)] hover:underline"
              >
                <Plus size={12} aria-hidden="true" />
                Nova categoria
              </button>
            </div>
            <select
              id="upload-categoria"
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]/20"
            >
              {categorias.length === 0 ? (
                <option value="">Nenhuma categoria disponível — crie uma acima</option>
              ) : (
                categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="upload-descricao"
              className="block text-sm font-medium text-[var(--color-foreground)]"
            >
              Descrição
            </label>
            <textarea
              id="upload-descricao"
              rows={2}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Breve descrição do conteúdo deste arquivo..."
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)]/70 focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]/20"
            />
          </div>

          {uploadMutation.isPending && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-[var(--color-muted-foreground)]">
                <span>Enviando arquivo...</span>
                <span className="font-mono">{progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-surface-subtle)]">
                <div
                  className="h-full bg-[var(--color-primary)] transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={uploadMutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={uploadMutation.isPending}>
              Enviar arquivo
            </Button>
          </div>
        </form>
      </Modal>

      <CategoryFormModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onCreated={(cat) => setCategoriaId(String(cat.id))}
      />
    </>
  );
}
