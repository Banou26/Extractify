/** @jsx h */
import { h } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import { Download } from 'react-feather'
import * as PDFJs from 'pdfjs-dist'
import { set, get } from 'idb-keyval'
// import pdf from 'url:../pdf.pdf'

import PDFViewer from './pdf-viewer'
import { PDF } from '../types'
import { getPDF, makePdf } from '../utils'

PDFJs.GlobalWorkerOptions.workerSrc = `${location.origin}/pdfjs-build/pdf.worker.js`

// fetch(pdf)
//   .then(res => res.blob())
//   .then(blob =>
//     fetch('http://localhost:5001/extractify-10ca0/us-central1/widgets/extract', {
//       method: 'POST',
//       body: blob,
//       mode: 'cors'
//     })
//   )
//   .then(res => res.json())
//   .then(json => console.log(json))

// fetch(pdf)
//   .then(res => res.blob())
//   .then(blob =>
//     fetch('http://localhost:5001/extractify-10ca0/us-central1/widgets/repair/2', {
//       method: 'POST',
//       body: blob,
//       mode: 'cors'
//     })
//   )
//   .then(res => res.arrayBuffer())
//   .then(v => console.log(URL.createObjectURL(new Blob([v], { type: 'image/png' }))))

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
