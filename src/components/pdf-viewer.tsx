/** @jsx h */
import { Fragment, h } from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'

import { buildSVG, getTextFromPage } from '../utils'

enum Display {
  SIMPLE = 'SIMPLE',
  COMPLEX = 'COMPLEX'
}

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
  const [display, setDisplay] = useState<Display>(Display.COMPLEX)
  return (
    <div className="pdf-wrapper">
      <h2>{name}</h2>
      <button onClick={() => setDisplay(!display)}>
        Switch to {display ? 'detailed' : 'simple'} display
      </button>
      <div className="pdf-view">
        {
          pages.map(page =>
            <PageRenderer
              key={`${name}-${page.number}`}
              page={page}
              pdf={pdf}
              display={display}
            />
          )
        }
      </div>
    </div>
  )
}
