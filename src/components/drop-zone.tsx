/** @jsx h */
import { h } from 'preact'
import { useState } from 'preact/hooks'
import { Download } from 'react-feather'

export default ({ children }) => {
  const [isHover, setIsHover] = useState(false)

  const onDrop = async ev =>
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

  return (
    <div
      className={`drag-zone ${isHover ? 'hover' : ''}`}
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
          onChange={onDrop}
        />
      </div>
      <div className="content">
        {children}
      </div>
    </div>
  )
}
