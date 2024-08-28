import React from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';

function PDFViewer({ fileUrl }) {
  const workerUrl = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

  return (
    <>
    <div className='pdf-container'>
      <Worker workerUrl={workerUrl}>
        <Viewer fileUrl={fileUrl} />
      </Worker>
    </div>
    <div><a href={fileUrl} download className="download-button"><div>Download PDF</div></a></div>
    </>
  );
}

export default PDFViewer;