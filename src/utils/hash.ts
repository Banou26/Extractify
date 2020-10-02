
export const getArrayBufferHash = async (arrayBuffer: ArrayBuffer) =>
  crypto
    .subtle
    .digest('SHA-256', arrayBuffer)
    .then(hashBuffer =>
      Array
        .from(new Uint8Array(hashBuffer))
        .map(b =>
          b
            .toString(16)
            .padStart(2, '0')
        ).join('')
    )
