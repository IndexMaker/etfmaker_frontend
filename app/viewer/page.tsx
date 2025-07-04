"use client";
import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { useSearchParams } from "next/navigation";
import Dashboard from "@/components/views/Dashboard/dashboard";
import { RichPDFViewer } from "@/components/pdfviewer/PDFFullViewer";

// Set PDF.js worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = "./pdf.js/pdf.worker.mjs";

export default function PDFViewer() {
  const searchParams = useSearchParams();
  const id = searchParams.get("reader");
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdf, setPdf] = useState<any>(null);
  const [numPages, setNumPages] = useState(0);

  useEffect(() => {
    const loadPDF = async () => {
      const pdf = await pdfjsLib.getDocument("/brand-book.pdf").promise;
      setPdf(pdf);
      setNumPages(pdf.numPages);
    };

    loadPDF();
  }, []);

  return (
    <Dashboard _sidebarOpen={true}>
      {/* <div
        ref={containerRef}
        style={{
          width: "100%",
          maxWidth: "800px",
          margin: "0 auto",
          overflowY: "auto",
          padding: "20px 0",
        }}
      >
        {Array.from({ length: numPages }).map((_, index) => (
          <PDFPage
            key={`page-${index + 1}`}
            pdf={pdf}
            pageNumber={index + 1}
            width={containerRef.current?.clientWidth || 800}
          />
        ))}
      </div> */}
      <RichPDFViewer className="bg-foreground text-primary" pdfUrl={'/brand-book.pdf'} />
    </Dashboard>
  );
}

function PDFPage({ pdf, pageNumber, width }: { pdf: any; pageNumber: number; width: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pdf) return;

    const renderPage = async () => {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: width / page.getViewport({ scale: 1 }).width });

      // Canvas rendering (original)
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext("2d")!, viewport }).promise;
      }

      // Mirror rendering for PostHog
      const mirror = mirrorRef.current;
      if (mirror) {
        mirror.style.width = `${viewport.width}px`;
        mirror.style.height = `${viewport.height}px`;
        mirror.innerHTML = `
          <div style="padding:10px;background:#f0f0f0;color:#333">
            PDF Page ${pageNumber} (${Math.round(viewport.width)}×${Math.round(viewport.height)}px)
          </div>
        `;
      }
    };

    renderPage();
  }, [pdf, pageNumber, width]);

  return (
    <div style={{ position: 'relative', marginBottom: '20px' }}>
      <canvas ref={canvasRef} />
      <div 
        ref={mirrorRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          visibility: 'hidden',
          pointerEvents: 'none',
          zIndex: -1
        }}
        aria-hidden="true"
      />
    </div>
  );
}
