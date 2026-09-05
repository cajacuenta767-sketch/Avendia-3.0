import { ChevronLeft, ChevronRight, FileWarning, LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";

type Props = {
  file: Blob;
  documentTitle: string;
};

type PdfPage = { width: number; height: number };

export function PdfDocumentPreview({ file, documentTitle }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const documentRef = useRef<PDFDocumentProxy | null>(null);
  const [pages, setPages] = useState<PdfPage[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    let loadingTask: ReturnType<typeof import("pdfjs-dist").getDocument> | undefined;
    queueMicrotask(() => {
      if (cancelled) return;
      setLoading(true);
      setError("");
      setCurrentPage(1);
    });

    void (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
        loadingTask = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
        const pdf = await loadingTask.promise;
        if (cancelled) return;
        documentRef.current = pdf;
        const nextPages = await Promise.all(Array.from({ length: pdf.numPages }, async (_, index) => {
          const page = await pdf.getPage(index + 1);
          const viewport = page.getViewport({ scale: 1 });
          return { width: viewport.width, height: viewport.height };
        }));
        if (!cancelled) setPages(nextPages);
      } catch {
        if (!cancelled) setError("No se pudo abrir la vista de páginas reales.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      loadingTask?.destroy();
      documentRef.current?.destroy();
      documentRef.current = null;
    };
  }, [file]);

  useEffect(() => {
    const pdf = documentRef.current;
    const canvas = canvasRef.current;
    const host = hostRef.current;
    const info = pages[currentPage - 1];
    if (!pdf || !canvas || !host || !info) return;
    const activePdf: PDFDocumentProxy = pdf;
    const activeCanvas: HTMLCanvasElement = canvas;
    const activeHost: HTMLDivElement = host;
    let cancelled = false;
    let renderTask: RenderTask | null = null;
    let requestedRender = 0;
    let renderQueue = Promise.resolve();
    const observer = new ResizeObserver(() => scheduleRender());
    observer.observe(activeHost);

    async function render(requestId: number) {
      if (cancelled || requestId !== requestedRender) return;
      const page = await activePdf.getPage(currentPage);
      if (cancelled || requestId !== requestedRender) return;
      const natural = page.getViewport({ scale: 1 });
      const availableWidth = Math.max(160, activeHost.clientWidth - 28);
      const mobileViewport = window.matchMedia("(max-width: 700px)").matches;
      const availableHeight = Math.max(
        220,
        Math.min(760, window.innerHeight * (mobileViewport ? 0.4 : 0.7)),
      );
      const scale = Math.min(1.5, availableWidth / natural.width, availableHeight / natural.height);
      const viewport = page.getViewport({ scale });
      const ratio = window.devicePixelRatio || 1;
      activeCanvas.width = Math.floor(viewport.width * ratio);
      activeCanvas.height = Math.floor(viewport.height * ratio);
      activeCanvas.style.width = `${Math.floor(viewport.width)}px`;
      activeCanvas.style.height = `${Math.floor(viewport.height)}px`;
      const context = activeCanvas.getContext("2d");
      if (!context || cancelled || requestId !== requestedRender) return;
      context.clearRect(0, 0, activeCanvas.width, activeCanvas.height);
      renderTask = page.render({ canvas: activeCanvas, canvasContext: context, viewport, transform: ratio === 1 ? undefined : [ratio, 0, 0, ratio, 0, 0] });
      await renderTask.promise;
      renderTask = null;
    }

    function scheduleRender() {
      const requestId = ++requestedRender;
      renderQueue = renderQueue
        .then(() => render(requestId))
        .catch((reason: unknown) => {
          if (!cancelled && (reason as { name?: string })?.name !== "RenderingCancelledException") {
            setError("No se pudo dibujar esta página del documento.");
          }
        });
    }

    scheduleRender();
    return () => {
      cancelled = true;
      requestedRender += 1;
      observer.disconnect();
      renderTask?.cancel();
    };
  }, [currentPage, pages]);

  if (error) return <p className="word-pdf-preview__error"><FileWarning />{error}</p>;
  if (loading) return <div className="word-pdf-preview__loading"><LoaderCircle className="is-spinning" />Preparando páginas reales del documento…</div>;

  return (
    <section className="word-pdf-preview" aria-label={`Páginas reales de ${documentTitle}`}>
      <aside className="word-pdf-preview__thumbnails" aria-label="Miniaturas de páginas">
        {pages.map((page, index) => <button key={index} type="button" className={currentPage === index + 1 ? "is-active" : ""} onClick={() => setCurrentPage(index + 1)} aria-label={`Ir a página ${index + 1}`}>
          <span style={{ aspectRatio: `${page.width} / ${page.height}` }}>Página {index + 1}</span>
        </button>)}
      </aside>
      <div className="word-pdf-preview__main">
        <nav className="word-preview-pager" aria-label="Páginas reales del documento">
          <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => page - 1)}><ChevronLeft size={18} />Anterior</button>
          <span aria-live="polite">Página {currentPage} de {pages.length}</span>
          <button type="button" disabled={currentPage === pages.length} onClick={() => setCurrentPage((page) => page + 1)}>Siguiente<ChevronRight size={18} /></button>
        </nav>
        <div className="word-pdf-preview__canvas" ref={hostRef}><canvas ref={canvasRef} /></div>
      </div>
    </section>
  );
}
