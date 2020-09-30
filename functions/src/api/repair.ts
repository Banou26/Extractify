import { recognize } from 'tesseract.js'

import app from '../app'
import { getPageImage, getDocument, wrapPDFPromise } from '../utils'

app.post(
  '/repair/:number', 
  (request, response) =>
    getDocument(request.body)
      .then(pdf => wrapPDFPromise(pdf.getPage(Number(request.params.number))))
      .then(getPageImage)
      .then(buffer => {
        recognize(
          buffer,
          'eng'
        ).then(({ data: { text } }) => response.end(text))
      })
)
