/** @jsx h */
import { h, Fragment } from 'preact'
import { useState } from 'preact/hooks'
import { useStore } from 'laco-react'

import store from '../store'

const importPDFJs = async () => {
  const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist')
  GlobalWorkerOptions.workerSrc = 'http://localhost:1234/pdfjs-build/pdf.worker.js'
  return getDocument
}

const getPDF = (pdf: ArrayBuffer) =>
  importPDFJs()
    .then(getDocument => getDocument({ data: pdf }))


const increment = () => store.set(state => ({ count: state.count + 1 }))
const decrement = () => store.set(state => ({ count: state.count - 1 }))

export default () => {
  const state = useStore(store)
  const [count, setCount] = useState(0)
  // const increment = () => setCount(count + 1)
  // const decrement = () => setCount((currentCount) => currentCount - 1)

  return (
    <Fragment>
      <p>Count: {count}</p>
      <p>Count: {state.count}</p>
      <button onClick={increment}>Increment</button>
      <button onClick={decrement}>Decrement</button>
    </Fragment>
  )
}
