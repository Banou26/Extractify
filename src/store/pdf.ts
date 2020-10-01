import type { PDFDocumentProxy, PDFPageProxy, PDFPromise } from 'pdfjs-dist'
import { set, get } from 'idb-keyval'

import store from './index'

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


get('files')
  .then(pdfs => )

await Promise.all(
  (await get('files'))?.map(async ({ name, arrayBuffer }) => {
    return makePdf({
      name,
      pdf: await getPDF(arrayBuffer),
      arrayBuffer: arrayBuffer
    })
  })
)
