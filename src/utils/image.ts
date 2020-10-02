import type { PDFPageProxy } from 'pdfjs-dist'
import { getPDF, PDF } from './pdf'

import { wrapPDFPromise } from '../utils'
import { getArrayBufferHash } from './hash'

const thumbnailCache = new Map()

export const getApiPDFImage =
  (arrayBuffer: ArrayBuffer, page = 1) =>
    fetch(
      `${process.env.API_URL}/image/${page}`,
      {
        method: 'POST',
        body: new Blob([arrayBuffer], { type: 'application/pdf'}),
        mode: 'cors'
      }
    ).then(res => res.arrayBuffer())

export const getPageImage =
  (page: PDFPageProxy, { scale } = { scale: 1.5 }): Promise<ArrayBuffer> => {
    const viewport = page.getViewport({ scale })
    const { height, width } = viewport
    const canvas = document.createElement('canvas')
    const canvasContext = canvas.getContext('2d')
    canvas.height = height
    canvas.width = width

    document.body.appendChild(canvas)

    return (
      wrapPDFPromise(
        page
          .render({ canvasContext, viewport })
          .promise
      ).then(async () => {
        const arrayBuffer =
          await new Promise(resolve => canvas.toBlob(blob => resolve(blob)))
            .then((blob: Blob) => blob.arrayBuffer())
        canvas.remove()
        return arrayBuffer
      })
    )
  }

export const getPdfThumbnail = (arrayBuffer: ArrayBuffer) =>
  Promise.race([
    getApiPDFImage(arrayBuffer),
    getPDF(arrayBuffer)
      .then(pdf => wrapPDFPromise(pdf.getPage(1)))
      .then(getPageImage)
  ])

export const getPDFThumbnailUrl =
  (arrayBuffer: ArrayBuffer) =>
    getArrayBufferHash(arrayBuffer)
      .then(hash =>
        thumbnailCache.has(hash)
          ? thumbnailCache.get(hash)
          : (
            getPdfThumbnail(arrayBuffer)
              .then(arrayBuffer => {
                thumbnailCache.set(hash, arrayBuffer)
                return URL.createObjectURL(
                  new Blob(
                    [arrayBuffer],
                    { type: 'image/png' }
                  )
                )
              })
          )
      )
