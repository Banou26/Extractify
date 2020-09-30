import { Util } from 'pdfjs-dist'
import * as tesseract from 'tesseract.js'
import * as PDFJs from 'pdfjs-dist'

import { PDF } from './types'

const SVG_NS = 'http://www.w3.org/2000/svg'

export const buildSVG = (viewport, textContent) => {
  const svg = document.createElementNS(SVG_NS, 'svg:svg')
  svg.setAttribute('width', viewport.width + 'px')
  svg.setAttribute('height', viewport.height + 'px')
  svg.setAttribute('font-size', '1')
  svg.setAttribute('overflow', 'visible')

  textContent.items.forEach(function (textItem) {
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

export const getTextFromPage = ({ pdf, pageNumber, logger }) =>
  pdf
    .getPage(pageNumber)
    .then(page => {
      const viewport = page.getViewport({ scale: 1.5 })
      const canvas = document.createElement('canvas')
      canvas.height = viewport.height
      canvas.width = viewport.width

      document.body.appendChild(canvas)

      return (
        page
          .render({ canvasContext: canvas.getContext('2d'), viewport: viewport })
          .promise
          .then(() =>
            tesseract
              .recognize(
                canvas.toDataURL(),
                'eng',
                { logger }
              )
              .then(({ data: { text } }) => {
                canvas.remove()
                return text
              })
          )
      )
    })

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
