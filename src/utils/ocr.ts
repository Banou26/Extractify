import { getPDF, wrapPDFPromise } from './pdf'
import { getPageImage } from './image'

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
