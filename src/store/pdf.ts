import { getOCRText, getPageTextContent, PDF, wrapPDFPromise } from '../utils'

import { set, get } from 'idb-keyval'

import store from './index'
import { getArrayBufferHash, getPDFThumbnailUrl, getPDF } from '../utils'
import { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'

export const decrement = () =>
  store.set(state => ({ count: state.count - 1 }))

export const importPDF =
  async (
    { name, arrayBuffer }:
    { name: string, arrayBuffer: ArrayBuffer }
  ) => {
    const hash = await getArrayBufferHash(arrayBuffer)
    const thumbnail = await getPDFThumbnailUrl(arrayBuffer)
    const textContent = await getPageTextContent(arrayBuffer)
    const ocrMap = new Map<number, string>()
    const pageMap = new Map<number, PDFPageProxy>()
    let _pdf: PDFDocumentProxy
    const pdf: PDF = {
      name,
      hash,
      arrayBuffer,
      thumbnail,
      textContent,
      ocr: (page: number) =>
        ocrMap.has(page)
          ? Promise.resolve(ocrMap.get(page))
          : (
            getOCRText(arrayBuffer, page)
              .then(str => {
                ocrMap.set(page, str)
                return str
              })
          ),
      pdf: () =>
        _pdf
          ? Promise.resolve(_pdf)
          : getPDF(arrayBuffer)
            .then(pdf => {
              _pdf = pdf
              return pdf
            }),
      page: (pageNumber: number) =>
        pageMap.has(pageNumber)
          ? Promise.resolve(pageMap.get(pageNumber))
          : (
            pdf
              .pdf()
              .then(pdf => wrapPDFPromise(pdf.getPage(pageNumber)))
              .then(page => {
                pageMap.set(pageNumber, page)
                return page
              })
          )
    }
    store.set(state => {
      return {
        ...state,
        history: [
          ...state.history,
          pdf
        ],
        pdfs: [
          ...state.pdfs,
          pdf
        ]
      }
    })
  }

// get('files')
//   .then((pdfs: PDF[]) =>
//     pdfs.forEach(({ arrayBuffer }) =>
//       importPDF(arrayBuffer)
//     )
//   )

// await Promise.all(
//   (await get('files'))?.map(async ({ name, arrayBuffer }) => {
//     return makePdf({
//       name,
//       pdf: await getPDF(arrayBuffer),
//       arrayBuffer: arrayBuffer
//     })
//   })
// )
