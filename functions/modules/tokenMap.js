const { getFirestore } = require('firebase-admin/firestore')
const firestore = getFirestore()

/**
 * Create token-map for query documents.
 * @param {string} v A target string of token-map.
 * @param {number} maxLength Max length of token-map charactor.
 * @returns
 */
const create = (v, maxLength = 2) => {
  if (!v) return null
  if (!(typeof v === 'string')) return null
  const str = v.replace(/\s+/g, '')
  const arr = []
  for (let i = 1; i <= maxLength; i++) {
    for (let j = 0; j <= str.length - 1; j++) {
      arr.push([str.substring(j, j + i).toLowerCase(), true])
    }
  }
  const result = Object.fromEntries(arr)
  return result
}

/**
 * Synchronize with the document for token-map.
 * @param {string} collectionId Collection name of parent document.
 * @param {string} docId Id of parent document.
 * @param {string} data Data of parent document.
 * @param {array} fields Array of field names to create token-map.
 */
const sync = async (collectionId, docId, data, fields) => {
  const path = `${collectionId}/${docId}/TokenMap/${docId}`
  const docRef = firestore.doc(path)
  const tokenMaps = fields.reduce((sum, current) => {
    return { ...sum, ...create(data[current]) }
  }, {})
  await docRef.set({
    parent: docRef.parent.parent,
    collection: collectionId,
    tokenMaps,
  })
}

/**
 * Remove the document for token-map.
 * @param {string} collectionId Collection name of parent document.
 * @param {string} docId Id of parent document.
 */
const remove = async (collectionId, docId) => {
  const path = `${collectionId}/${docId}/TokenMap/${docId}`
  const docRef = firestore.doc(path)
  await docRef.delete()
}

exports.create = create
exports.sync = sync
exports.remove = remove
