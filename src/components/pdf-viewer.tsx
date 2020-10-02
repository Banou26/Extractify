import { TextContent } from 'pdfjs-dist'
/** @jsx h */
import { Fragment, h } from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'

import { buildSVG, getOCRText, getTextFromPage, PDF } from '../utils'

enum Display {
  SIMPLE = 'SIMPLE',
  COMPLEX = 'COMPLEX'
}

export const PageRenderer =
  (
    { arrayBuffer, textContent, number, ocr, pdf, page, display }:
    Omit<PDF, 'textContent'> & { number: number, textContent: TextContent, display: Display }
  ) => {
    const ref = useRef(null)
    const [ocrProgress, setOCRProgress] = useState(0)
    const [ocrStr, setOCRStr] = useState(null)
    console.log('page-renderer', textContent, number, display)
    useEffect(() => {
      if (!ref.current) return
      if (display) {
        ref.current.children[0].remove()
      } else {
        page(number).then(page => {
          ref.current.appendChild(
            buildSVG(
              page.getViewport({ scale: 2.75 }),
              textContent
            )
          )
        })
      }
    }, [ref, display])
    console.log(textContent.items)
    return (
      <Fragment>
        <button
          disabled={!!ocrProgress}
          onClick={() => {
            getOCRText(arrayBuffer, number).then(v => setOCRStr(v))
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
                        textContent.items.map(({ str }) =>
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

export default ({ pdf: { arrayBuffer, name, textContent, ocr, pdf, page } }: { pdf: PDF }) => {
  const [display, setDisplay] = useState<Display>(Display.COMPLEX)

  return (
    <div className="pdf-wrapper">
      <h2>{name}</h2>
      <button onClick={() => setDisplay(!display)}>
        Switch to {display ? 'detailed' : 'simple'} display
      </button>
      <div className="pdf-view">
        {
          textContent.map((textContent, i) =>
            <PageRenderer
              key={`${name}-${i}`}
              textContent={textContent}
              arrayBuffer={arrayBuffer}
              number={i}
              ocr={ocr}
              pdf={pdf}
              page={page}
              display={display}
            />
          )
        }
      </div>
    </div>
  )
}
