/** @jsx h */
import { Fragment, h } from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'
import { Util } from 'pdfjs-dist'
import * as tesseract from 'tesseract.js'

const SVG_NS = 'http://www.w3.org/2000/svg'

const buildSVG = (viewport, textContent) => {
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

const getTextFromPage = ({ pdf, pageNumber, logger }) =>
  pdf
    .getPage(pageNumber)
    .then(page => {
      const viewport = page.getViewport({ scale: 1.5 })

      const canvas = document.createElement('canvas')
      document.body.appendChild(canvas)
      const context = canvas.getContext('2d')
      canvas.height = viewport.height
      canvas.width = viewport.width

      const renderContext = { canvasContext: context, viewport: viewport }
      const renderTask = page.render(renderContext)
      return (
        renderTask
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

export const PageRenderer = ({ pdf, page: { page, textContent, number, lines }, display }: { page: Page, display: boolean }) => {
  const ref = useRef(null)
  const [ocrProgress, setOCRProgress] = useState(0)
  const [ocrStr, setOCRStr] = useState(null)

  useEffect(() => {
    if (!ref.current) return
    if (display) {
      ref.current.children[0].remove()
    } else {
      ref.current.appendChild(
        buildSVG(
          page.getViewport({ scale: 2.75 }),
          textContent
        )
      )
    }
  }, [ref, display])

  return (
    <Fragment>
      <button
        disabled={!!ocrProgress}
        onClick={() => {
          getTextFromPage({
            pdf,
            pageNumber: number,
            logger: (v) => setOCRProgress(v.progress)
          }).then(v => setOCRStr(v))
        }}
      >
        repair{!!ocrProgress ? 'ing' : ''} page {!!ocrProgress ? `(${Math.round(ocrProgress * 100)}%)` : ''}
      </button>
      <div>
        {
          ocrStr
            ? ocrStr
            : (
              display
                ? (
                  <div className="pdf-page">
                    {
                      lines.map(({ str }) =>
                        <span>
                          {str} &nbsp;
                        </span>
                      )
                    }
                  </div>
                )
                : <div ref={ref}/>
            )
        }
      </div>
    </Fragment>
  )
}

export default ({ pdf: { pdf, name, pages } }: { pdf: PDF }) => {
  const [display, setDisplay] = useState(false)
  return (
    <div className="pdf-wrapper">
      <h2>{name}</h2>
      <button onClick={() => setDisplay(!display)} >
        Switch to {display ? 'detailed' : 'simple'} display
      </button>
      <div className="pdf-view">
        {
          pages.map(page =>
            <PageRenderer key={`${name}-${page.number}`} page={page} pdf={pdf} display={display}/>
          )
        }
      </div>
    </div>
  )
}
