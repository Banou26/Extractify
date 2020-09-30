import app from '../app'
import { getPageImage, getDocument, wrapPDFPromise } from '../utils'

app.post(
  '/image/:number',
  (request, response) =>
    getDocument(request.body)
      .then(pdf => wrapPDFPromise(pdf.getPage(Number(request.params.number))))
      .then(getPageImage)
      .then(buffer => {
        response.setHeader('Content-Type', 'image/png')
        response.end(buffer)
      })
)