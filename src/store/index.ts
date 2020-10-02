import { Store } from 'laco'

export * from './pdf'

export default new Store({
  offline: false,
  history: [],
  pdfs: []
})
