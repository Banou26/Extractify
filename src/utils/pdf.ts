import type { PDFDocumentProxy, PDFPageProxy, PDFPromise, TextContent } from 'pdfjs-dist'
import { getPageImage } from './image'

export interface PDF {
  hash: string
  thumbnail: string
  arrayBuffer: ArrayBuffer
  name: string
  textContent: TextContent[]
  ocr: (number: number) => Promise<string>,
  pdf: () => Promise<PDFDocumentProxy>,
  page: (pageNumber: number) => Promise<PDFPageProxy>
}

const SVG_NS = 'http://www.w3.org/2000/svg'

export const wrapPDFPromise =
  <T = any>(pdfPromise: PDFPromise<T>): Promise<T> =>
    new Promise((resolve, reject) => pdfPromise.then(resolve, reject))

export const importPdf = () =>
  import('pdfjs-dist')
    .then((PDFJs) => {
      PDFJs.GlobalWorkerOptions.workerSrc = `${location.origin}/pdfjs-build/pdf.worker.js`
      return PDFJs
    })

export const getPDF = (file: ArrayBuffer) =>
  importPdf()
    .then(({ getDocument }) =>
      wrapPDFPromise(getDocument(file).promise)
    )

export const getAllPages = (pdf: PDFDocumentProxy) =>
  Promise.all(
    new Array(pdf.numPages)
      .fill(undefined)
      .map(async (_, i) => pdf.getPage(i + 1))
  )

export const getApiPDFTextContent =
  (arrayBuffer: ArrayBuffer) =>
    fetch(
      `${process.env.API_URL}/extract`,
      {
        method: 'POST',
        body: new Blob([arrayBuffer], { type: 'application/pdf'}),
        mode: 'cors'
      }
    ).then(res => res.json())

export const getApiPDFOCRText =
  (arrayBuffer: ArrayBuffer, page = 1) =>
    fetch(
      `${process.env.API_URL}/repair/${page}`,
      {
        method: 'POST',
        body: new Blob([arrayBuffer], { type: 'application/pdf'}),
        mode: 'cors'
      }
    ).then(res => res.text())

export const OCRImage =
  (arrayBuffer: ArrayBuffer, { logger } = { logger: () => {} }) =>
    import('tesseract.js')
      .then(({ recognize }) => recognize(arrayBuffer, 'eng', { logger }))
      .then(({ data: { text } }) => text)

export const getOCRText = (arrayBuffer: ArrayBuffer, page: number) =>
  Promise.race([
    getApiPDFOCRText(arrayBuffer, page),
    // todo: replace this with an util function
    getPDF(arrayBuffer)
      .then(pdf => wrapPDFPromise(pdf.getPage(page)))
      .then(getPageImage)
      .then(imageArrayBuffer => OCRImage(imageArrayBuffer))
  ])

export const getPDFTextContent = (page: PDFPageProxy) =>
  wrapPDFPromise(page.getTextContent())

export const pageText = (page: PDFPageProxy) =>
  getPDFTextContent(page)
    .then(textContent =>
      textContent
        .items
        .map(({ str }) => str)
        .join(' ')
    )

export const getPageTextContent = (arrayBuffer: ArrayBuffer) =>
  Promise.race([
    getApiPDFTextContent(arrayBuffer),
    getPDF(arrayBuffer)
      .then(getAllPages)
      .then(pages =>
        Promise.all(
          pages.map(page =>
            wrapPDFPromise(page.getTextContent())
          )
        )
      )
  ])

export const buildSVG = async (viewport, textContent: TextContent) => {
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
