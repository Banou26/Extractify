import type { PDFPageProxy } from 'pdfjs-dist'

import * as tesseract from 'tesseract.js'
import * as PDFJs from 'pdfjs-dist'

import { PDF } from './types'

export const wrapPDFPromise = <T = any>(pdfPromise: PDFJs.PDFPromise<T>): Promise<T> =>
  new Promise((resolve, reject) => pdfPromise.then(resolve, reject))

const SVG_NS = 'http://www.w3.org/2000/svg'

export const buildSVG = (viewport, textContent) => {
  const svg = document.createElementNS(SVG_NS, 'svg:svg')
  svg.setAttribute('width', viewport.width + 'px')
  svg.setAttribute('height', viewport.height + 'px')
  svg.setAttribute('font-size', '1')
  svg.setAttribute('overflow', 'visible')

  textContent.items.forEach(function (textItem) {
    const tx = PDFJs.Util.transform(
      PDFJs.Util.transform(viewport.transform, textItem.transform),
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

export const getPageImage = (page: PDFPageProxy, { scale } = { scale: 1.5 }): Promise<ArrayBuffer> => {
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
    ).then(() => {
      const arrayBuffer =
        canvasContext
          .getImageData(0, 0, width, height)
          .data
          .buffer
      canvas.remove()
      return arrayBuffer
    })
  )
}

export const getTextFromPage = (page: PDFPageProxy, { logger }) =>
  getPageImage(page)
    .then(arrayBuffer =>
      tesseract.recognize(
        arrayBuffer,
        'eng',
        { logger }
      )
    )
    .then(({ data: { text } }) => text)

export const makePdf = async ({ name, pdf, arrayBuffer }: Partial<PDF>): Promise<PDF> => ({
  arrayBuffer,
  pdf,
  name,
  pages:
    await Promise.all(
      (await Promise.all(
        new Array(pdf.numPages)
          .fill(undefined)
          .map((_, i) => pdf.getPage(i + 1))
      )).map(async page => ({
        page,
        number: page.pageNumber,
        textContent: await page.getTextContent()
      }))
    )
})

export const getPDF = file =>
  PDFJs
    .getDocument(file)
    .promise

const thumbnailCache = new Map()

const getArrayBufferHash = async (arrayBuffer: ArrayBuffer) =>
  crypto
    .subtle
    .digest('SHA-256', arrayBuffer)
    .then(hashBuffer =>
      Array
        .from(new Uint8Array(hashBuffer))
        .map(b =>
          b
            .toString(16)
            .padStart(2, '0')
        ).join('')
    )

export const getApiPDFThumbnailArrayBuffer =
  (arrayBuffer: ArrayBuffer) =>
    fetch(
      `${process.env.URL_API}/image/1`,
      {
        method: 'POST',
        body: new Blob([arrayBuffer]),
        mode: 'cors'
      }
    ).then(res => res.arrayBuffer())

export const getPDFThumbnailUrl =
  (arrayBuffer: ArrayBuffer) =>
    getArrayBufferHash(arrayBuffer)
      .then(hash =>
        thumbnailCache.has(hash)
          ? thumbnailCache.get(hash)
          : (
            getApiPDFThumbnailArrayBuffer(arrayBuffer)
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
