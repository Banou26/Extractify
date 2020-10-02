/** @jsx h */
import { h } from 'preact'
import { useState } from 'preact/hooks'
import { Download } from 'react-feather'
import { importPDF } from '../store/pdf'

export default ({ children }) => {
  const [isHover, setIsHover] = useState(false)

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
    <div
      className={`drag-zone ${isHover ? 'hover' : ''}`}
      onDragOver={() => setIsHover(true)}
    >
      <div
        className="drop-zone"
        onDrop={() => setIsHover(false)}
      >
        <span>You can now drop your file :)</span>
        <Download size="10rem"/>
        <input
          onDragLeave={() => setIsHover(false)}
          type="file"
          accept="application/pdf"
          multiple={true}
          onChange={onDrop}
        />
      </div>
      <div className="content">
        {children}
      </div>
    </div>
  )
}
