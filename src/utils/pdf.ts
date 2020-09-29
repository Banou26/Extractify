// import workerPath from 'url:../pdf.worker.js'
let PDFJS
export const importPDFJs = async () => {
  if (PDFJS) return PDFJS
  const PDFJs = await import('pdfjs-dist')
  if (!PDFJS) PDFJS = PDFJs
  PDFJs.GlobalWorkerOptions.workerSrc = 'http://localhost:1234/pdfjs-build/pdf.worker.js'
  return PDFJs
}

export const getPDF = (pdf) =>
  importPDFJs()
    .then(PDFJs => PDFJs.getDocument(pdf).promise)

// export const getPDF = (pdf: string | ArrayBuffer) =>
//   importPDFJs()
//     .then(PDFJs => PDFJs.getDocument(typeof pdf === 'string' ? pdf : { data: pdf }).promise)
