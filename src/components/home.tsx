/** @jsx h */
import { h } from 'preact'
import { useStore } from 'laco-react'

import store from '../store'
import PDFViewer from './pdf-viewer'
import { importPDF } from '../store/pdf'

export default () => {
  const { pdfs } = useStore(store)

  const onDrop = ev =>
    [...(ev.target as HTMLInputElement).files]
      .forEach(file =>
        file
          .arrayBuffer()
          .then(arrayBuffer =>
            importPDF({ name: file.name, arrayBuffer })
          )
      )

  return (
    <div className="home">
      <div>
        <p>
          To start using the app, you can drag and drop PDF files<br/>or you can use this file input instead :)
        </p>
        <input
          type="file"
          accept="application/pdf"
          multiple={true}
          onChange={onDrop}
        />
      </div>
      <div>
        {
          pdfs.length || undefined
          && (
            pdfs.map(pdf =>
              <PDFViewer pdf={pdf}/>
            )
          )
        }
      </div>
    </div>
  )
}
