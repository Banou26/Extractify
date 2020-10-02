import type { PDFDocumentProxy, PDFPageProxy, PDFPromise } from 'pdfjs-dist'

export interface PDF {
  hash: string
  thumbnail: string
  arrayBuffer: ArrayBuffer
  pdf: PDFDocumentProxy
}

export const importPdf = () =>
  import('pdfjs-dist')
    .then((PDFJs) => {
      PDFJs.GlobalWorkerOptions.workerSrc = `${location.origin}/pdfjs-build/pdf.worker.js`
      return PDFJs
    })

const SVG_NS = 'http://www.w3.org/2000/svg'

export const wrapPDFPromise =
  <T = any>(pdfPromise: PDFPromise<T>): Promise<T> =>
    new Promise((resolve, reject) => pdfPromise.then(resolve, reject))

export const OCRImage = (arrayBuffer: ArrayBuffer, { logger }) =>
  import('tesseract.js')
    .then(({ recognize }) => recognize(arrayBuffer, 'eng', { logger }))
    .then(({ data: { text } }) => text)

export const pageText = (page: PDFPageProxy) =>
  wrapPDFPromise(page.getTextContent())
    .then(textContent =>
      textContent
        .items
        .map(({ str }) => str)
        .join(' ')
    )

export const buildSVG = async (viewport, textContent) => {
  const { Util } = await importPdf()
  const svg = document.createElementNS(SVG_NS, 'svg:svg')
  svg.setAttribute('width', viewport.width + 'px')
  svg.setAttribute('height', viewport.height + 'px')
  svg.setAttribute('font-size', '1')
  svg.setAttribute('overflow', 'visible')

  textContent.items.forEach(textItem => {
    const tx = Util.transform(
      Util.transform(viewport.transform, textItem.transform),
      [1, 0, 0, -1, 0, 0]
    )
    const style = textContent.styles[textItem.fontName]
    const text = document.createElementNS(SVG_NS, 'svg:text')
    text.setAttribute('transform', `matrix(${tx.join(' ')})`)
    text.setAttribute('font-family', style.fontFamily)
    text.setAttribute('fill', 'white')
    text.textContent = textItem.str
    svg.appendChild(text)
  })
  return svg
}

export const getPDF = (file: ArrayBuffer) =>
  importPdf()
    .then(({ getDocument }) =>
      wrapPDFPromise(getDocument(file).promise)
    )
