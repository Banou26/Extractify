/** @jsx h */
import { h } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import { Download } from 'react-feather'
import * as PDFJs from 'pdfjs-dist'
import { set, get } from 'idb-keyval'

import PDFViewer from './pdf-viewer'

PDFJs.GlobalWorkerOptions.workerSrc = 'http://localhost:1234/pdfjs-build/pdf.worker.js'

const getPDF = file => PDFJs.getDocument(file).promise

const makePdf = async ({ name, pdf, arrayBuffer, simpleDisplay }: Partial<PDF>): Promise<PDF> => ({
  simpleDisplay,
  arrayBuffer,
  pdf,
  name,
  pages:
    await Promise.all(
      (await Promise.all(
        new Array(pdf.numPages)
          .fill(undefined)
          .map((_, i) => pdf.getPage(i + 1))
      )).map(async page => {
        const textContent = await page.getTextContent()
        
        return {
          page,
          number: page.pageNumber,
          textContent,
          lines: textContent.items
        }
      })
    )
})

interface Line {
  str: string
  fontName: string
}

interface Page {
  page: any
  number: number
  lines: Line[]
  textContent: any
}

interface PDF {
  arrayBuffer: ArrayBuffer
  pdf: any
  name: string
  pages: Page[]
  simpleDisplay: boolean
}

const dedupeFiles = arr =>
  [
    ...new Map(
      arr.map(({ name, arrayBuffer }) => [name, { arrayBuffer, name }])
    ).entries()
  ].map(([_, file]) => file)

export default () => {
  const [files, setFiles] = useState<PDF[]>([])
  const [filesHistory, setFilesHistory] = useState<PDF[]>([])
  const [isHover, setIsHover] = useState(false)

  useEffect(() => {
    (async () => {
      setFilesHistory(
        await Promise.all(
          (await get('files'))?.map(async ({ name, arrayBuffer }) => {
            return makePdf({
              simpleDisplay: true,
              name,
              pdf: await getPDF(arrayBuffer),
              arrayBuffer: arrayBuffer
            })
          })
        )
      )
    })()
  }, [])

  useEffect(() => {
    if (!files.length) return
    set(
      'files',
      dedupeFiles([...filesHistory, ...files])
    )
    void (async () => {
      setFilesHistory(
        await Promise.all(
          dedupeFiles([...filesHistory, ...files])
            .map(async ({ name, arrayBuffer }) => {
              return makePdf({
                simpleDisplay: true,
                name,
                pdf: await getPDF(arrayBuffer),
                arrayBuffer: arrayBuffer
              })
            })
        )
      )
    })()
  }, [files.map(({ name }) => name).join(' ')])

  return (
    <div
      className={`home ${isHover ? 'drag-hover' : ''}`}
      onDragOver={() => setIsHover(true)}
    >
      <div
        className="drop-zone"
        onDrop={() => setIsHover(false)}
      >
        <span>You can now drop your file here :)</span>
        <Download size="10rem"/>
        <input
          onDragLeave={() => setIsHover(false)}
          type="file"
          multiple={true}
          onChange={async ev =>
            setFiles(
              await Promise.all(
                [...(ev.target as HTMLInputElement).files]
                  .map(async file => {
                    const arrayBuffer = await file.arrayBuffer()
                    return makePdf({
                      simpleDisplay: true,
                      name: file.name,
                      pdf: await getPDF(arrayBuffer),
                      arrayBuffer: arrayBuffer
                    })
                  })
              )
            )
          }
        />
      </div>
      <div className="history">
        <h3>PDF history</h3>
        <button
          onClick={() => {
            set('files', [])
            setFilesHistory([])
          }}
        >
          clear history
        </button>
        {
          filesHistory.map(({ name, arrayBuffer }: Pick<PDF, 'name' | 'arrayBuffer'>) =>
            <div
              className="item"
              onClick={async () =>
                setFiles(
                  [
                    await makePdf({
                      simpleDisplay: true,
                      name,
                      pdf: await getPDF(arrayBuffer),
                      arrayBuffer: arrayBuffer
                    })
                  ]
                )
              }
            >
              {name}
            </div>
          )
        }
      </div>
      <div>
        {
          files.length
            ? files.map(pdf => <PDFViewer pdf={pdf}/>)
            : <div>To start using the app, you can drag and drop PDF files !</div>
        }
      </div>
    </div>
  )
}
