/** @jsx h */
import { h } from 'preact'
import { useStore } from 'laco-react'

import store from '../store'
import { PDF } from '../utils'

export default () => {
  const { history } = useStore(store)

  return (
    <div className="history">
      <h3>PDF history</h3>
      <button
        // onClick={() => {
        //   set('files', [])
        //   setFilesHistory([])
        // }}
      >
        clear history
      </button>
      {
        history.map(({ name, thumbnail, arrayBuffer }: Pick<PDF, 'name' | 'thumbnail' | 'arrayBuffer'>) =>
          <div
            className="item"
            onClick={async () => {}
              // setFiles(
              //   [
              //     await makePdf({
              //       name,
              //       pdf: await getPDF(arrayBuffer),
              //       arrayBuffer: arrayBuffer
              //     })
              //   ]
              // )
            }
          >
            {name}
          </div>
        )
      }
    </div>
  )
}
