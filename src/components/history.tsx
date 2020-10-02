/** @jsx h */
import { h } from 'preact'
import { useStore } from 'laco-react'

import store, { clearHistory, selectSavedPDF } from '../store'
import { PDF } from '../utils'

export default () => {
  const { history } = useStore(store)

  return (
    <div className="history">
      <h3>PDF history</h3>
      <button onClick={() => clearHistory()}>
        clear history
      </button>
      {
        history.map((pdf) =>
          <div
            className="item"
            onClick={async () => selectSavedPDF(pdf)}
          >
            <img src={pdf.thumbnail} className="thumbnail"/>
            {pdf.name}
          </div>
        )
      }
    </div>
  )
}
