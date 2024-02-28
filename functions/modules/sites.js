/* NO USE */
const {
  onDocumentCreated,
  onDocumentUpdated,
  onDocumentDeleted,
} = require('firebase-functions/v2/firestore')
const { getFirestore } = require('firebase-admin/firestore')
const { info } = require('firebase-functions/logger')
const firestore = getFirestore()

exports.onCreate = onDocumentCreated('Sites/{docId}', async (event) => {
  info(`A document of Sites collection has been created.`)
  const data = event.data.data()
  await syncTokenMap(event.params.docId, data)
  info(`The document for the token map has been created successfull.`)
})

exports.onUpdate = onDocumentUpdated('Sites/{docId}', async (event) => {
  info(`A document of Sites collection has been updated.`)
  const data = event.data.after.data()
  await syncTokenMap(event.params.docId, data)
  info(`The document for the token map has been updated successfull.`)
})

exports.onDelete = onDocumentDeleted('Sites/{docId}', async (event) => {
  info(`A document of Sites collection has been deleted.`)
  await firestore.doc(`SitesTokenMap/${event.params.docId}`).delete()
  info(`The document created for the token map has been deleted successfull.`)
})

const syncTokenMap = async (docId, data) => {
  const fields = ['name', 'abbr', 'abbrKana']
  const tokenMap = fields.reduce((sum, current) => {
    return { ...sum, ...createTokenMap(data[current]) }
  }, {})
  await firestore.doc(`SitesTokenMap/${docId}`).set({ ...data, tokenMap })
}

/**
 * Create tokem-map for query documents.
 * @param {string} v A target string of token-map.
 * @returns An object for token-map.
 */
const createTokenMap = (v) => {
  if (!v) return null
  if (!(typeof v === 'string')) return null
  const str = v.replace(/\s+/g, '')
  const arr = []
  for (let i = 0; i <= str.length - 1; i++) {
    arr.push([str.substring(i, i + 1).toLowerCase(), true])
  }
  for (let i = 0; i <= str.length - 2; i++) {
    arr.push([str.substring(i, i + 2).toLowerCase(), true])
  }
  const result = Object.fromEntries(arr)
  return result
}
