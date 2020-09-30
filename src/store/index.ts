import { Store } from 'laco'

const store = new Store({
  offline: false,
  history: [],
  pdf: []
})
export default store

export const openPDF = () =>
  store.set(state => {
    

    return {
      ...state,
      history: [
        ...state.history
      ],
      pdf: [
        ...state.pdf
      ]
    }
  })

export const decrement = () =>
  store.set(state => ({ count: state.count - 1 }))
