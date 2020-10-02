/** @jsx h */
import { h } from 'preact'
import { useState } from 'preact/hooks'
import { Download } from 'react-feather'

export default () => {
  const [isHover, setIsHover] = useState(false)

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
    </div>
  )
}

// <div className="history">
//   <h3>PDF history</h3>
//   <button
//     onClick={() => {
//       set('files', [])
//       setFilesHistory([])
//     }}
//   >
//     clear history
//   </button>
//   {
//     filesHistory.map(({ name, arrayBuffer }: Pick<PDF, 'name' | 'arrayBuffer'>) =>
//       <div
//         className="item"
//         onClick={async () =>
//           setFiles(
//             [
//               await makePdf({
//                 name,
//                 pdf: await getPDF(arrayBuffer),
//                 arrayBuffer: arrayBuffer
//               })
//             ]
//           )
//         }
//       >
//         {name}
//       </div>
//     )
//   }
// </div>
