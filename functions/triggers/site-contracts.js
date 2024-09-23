const { getFirestore } = require('firebase-admin/firestore')
const {
  onDocumentCreated,
  onDocumentDeleted,
} = require('firebase-functions/v2/firestore')

const firestore = getFirestore()

/**
 * Firestoreドキュメント作成時のトリガー
 * - SiteContractsコレクションにドキュメントが作成されると発火。
 * - 関連するSiteドキュメントの`hasContract`フィールドをtrueに更新します。
 * @param {Object} event - Firestoreイベントオブジェクト
 */
exports.onCreate = onDocumentCreated('SiteContracts/{docId}', async (event) => {
  const siteId = event.data.data().siteId // siteIdをtry外で取得
  try {
    const docRef = firestore.collection('Sites').doc(siteId)
    // SiteドキュメントのhasContractフィールドをtrueに更新
    await docRef.update({ hasContract: true })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(
      `Error updating hasContract to true for siteId: ${siteId}. Error: ${err.message}. Stack: ${err.stack}`
    )
  }
})

/**
 * Firestoreドキュメント削除時のトリガー
 * - SiteContractsコレクションからドキュメントが削除されると発火。
 * - 同じsiteIdに関連する他の契約がない場合、対応するSiteドキュメントの`hasContract`フィールドをfalseに更新します。
 * @param {Object} event - Firestoreイベントオブジェクト
 */
exports.onDelete = onDocumentDeleted('SiteContracts/{docId}', async (event) => {
  const siteId = event.data.data().siteId // siteIdをtry外で取得
  try {
    // 同じsiteIdを持つ他のSiteContractsドキュメントが存在するか確認
    const contractsQuery = firestore
      .collection('SiteContracts')
      .where('siteId', '==', siteId)
      .limit(1)
    const contractsQuerySnapshot = await contractsQuery.get()

    // 他の契約が存在しない場合にのみhasContractをfalseに更新
    if (contractsQuerySnapshot.empty) {
      const docRef = firestore.collection('Sites').doc(siteId)
      await docRef.update({ hasContract: false })
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(
      `Error updating hasContract to false for siteId: ${siteId}. Error: ${err.message}. Stack: ${err.stack}`
    )
  }
})
