import app from '../app'
import { getAllPages, getDocument, wrapPDFPromise } from '../utils'

app.post(
  '/extract',
  (request, response) =>
    getDocument(request.body)
      .then(getAllPages)
      .then(pages =>
        Promise.all(
          pages.map(page =>
            wrapPDFPromise(page.getTextContent())
          )
        )
      )
      .then(textContents => {
        response.end(
          JSON.stringify(
            textContents
          )
        )
      })
)
