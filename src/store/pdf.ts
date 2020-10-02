import type { PDFDocumentProxy, PDFPageProxy, PDFPromise } from 'pdfjs-dist'
import type { PDF } from '../utils'

import { set, get } from 'idb-keyval'

import store from './index'
import { getArrayBufferHash, getPDFThumbnailUrl, getPDF } from '../utils'

export const openPDF = (pdf: PDFDocumentProxy) =>
  store.set(state => {
    
    return {
      ...state,
      history: [
        ...state.history
      ],
      pdf: [
        ...state.pdf
      ]
    }
  })

export const decrement = () =>
  store.set(state => ({ count: state.count - 1 }))

export const importPDF =
  async (
    { name, arrayBuffer }:
    { name: string, arrayBuffer: ArrayBuffer }
  ) => {
    const hash = await getArrayBufferHash(arrayBuffer)
    const _pdf = await getPDF(arrayBuffer)
    const thumbnail = await getPDFThumbnailUrl({ arrayBuffer, pdf: _pdf })
    const pdf: PDF = {
      hash,
      arrayBuffer,
      pdf: _pdf,
      thumbnail
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
