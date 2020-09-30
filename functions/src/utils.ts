import type { PDFDocumentProxy, PDFPageProxy, PDFPromise } from 'pdfjs-dist'
// @ts-ignore
import { getDocument as _getDocument } from 'pdfjs-dist/es5/build/pdf.js'
import { createCanvas } from 'canvas'

export const wrapPDFPromise = <T = any>(pdfPromise: PDFPromise<T>): Promise<T> =>
  new Promise((resolve, reject) => pdfPromise.then(resolve, reject))

export const getDocument = (arrayBuffer: Buffer): Promise<PDFDocumentProxy> =>
  wrapPDFPromise(
    _getDocument({ data: arrayBuffer }).promise
  )

export const getAllPages = (pdf: PDFDocumentProxy) =>
  Promise.all(
    new Array(pdf.numPages)
      .fill(undefined)
      .map(async (_, i) => pdf.getPage(i + 1))
  )

export const getPageImage = (page: PDFPageProxy): Promise<Buffer> =>
    new Promise((resolve, reject) => {
      const viewport = page.getViewport({ scale: 1.5 })
      const canvas = createCanvas(viewport.width, viewport.height)

      page
        .render({
          canvasContext: canvas.getContext('2d'),
          viewport: viewport
        })
        .promise
        .then(() => resolve(canvas.toBuffer()), reject)
    })
