/**
 * 現場取極めドキュメントトリガー
 * @author shisyamo4131
 * @refact 2025-01-29
 */
import {
  onDocumentCreated,
  onDocumentDeleted,
} from 'firebase-functions/v2/firestore'
import { logger } from 'firebase-functions/v2'
import { getFirestore } from 'firebase-admin/firestore'
const firestore = getFirestore()

/****************************************************************************
 * 作成時のトリガー
 * - 関連する `Site` ドキュメントの `hasContract` フィールドを `true` に更新します。
 * @param {Object} event - Firestoreイベントオブジェクト
 ****************************************************************************/
export const onCreate = onDocumentCreated(
  'SiteContracts/{docId}',
  async (event) => {
    const docId = event.params.docId
    const { siteId } = event.data.data()

    // siteId が存在しない場合の処理
    if (!siteId) {
      logger.error(`現場取極めドキュメントに siteId が設定されていません。`, {
        docId,
      })
      return
    }

    /***********************************************************************
     * hasContract プロパティ同期処理
     ***********************************************************************/
    try {
      logger.info(
        `現場取極めドキュメントが作成されました。現場の hasContract プロパティとの同期処理を開始します。`,
        { docId, siteId }
      )

      await updateSiteHasContract(siteId, true)

      logger.info(
        `現場ドキュメントの hasContract プロパティを true に更新しました。`,
        { siteId }
      )
    } catch (err) {
      logger.error(
        `現場ドキュメントの hasContract プロパティ更新処理でエラーが発生しました。`,
        { err }
      )
    }
  }
)

/****************************************************************************
 * 削除時のトリガー
 * - 同一現場の他の現場取極めドキュメントが存在しない場合に、現場ドキュメントの
 *   hasContract プロパティを false に更新します。
 ****************************************************************************/
export const onDelete = onDocumentDeleted(
  'SiteContracts/{docId}',
  async (event) => {
    const docId = event.params.docId
    const { siteId } = event.data.data()

    // siteId が存在しない場合の処理
    if (!siteId) {
      logger.error(`現場取極めドキュメントに siteId が設定されていません。`, {
        docId,
      })
      return
    }

    /***********************************************************************
     * hasContract プロパティ同期処理
     ***********************************************************************/
    try {
      logger.info(
        `現場取極めドキュメントが削除されました。現場の hasContract プロパティとの同期処理を開始します。`,
        { docId, siteId }
      )

      const hasOtherContracts = await isSiteContractExist(siteId)

      if (!hasOtherContracts) {
        logger.info(
          `同一現場の他の現場取極めドキュメントが存在しませんでした。現場の hasContract プロパティを false に更新します。`,
          { siteId }
        )
        await updateSiteHasContract(siteId, false)

        logger.info(
          `現場ドキュメントの hasContract プロパティを false に更新しました。`,
          { siteId }
        )
      } else {
        logger.info(
          `他の現場取極めドキュメントが存在するため、hasContract プロパティの同期処理は不要です。`,
          { siteId }
        )
      }
    } catch (err) {
      logger.error(
        `現場ドキュメントの hasContract プロパティ更新処理でエラーが発生しました。`,
        { err }
      )
    }
  }
)

/**
 * 指定された現場IDに従属する現場取極めドキュメントが存在するかどうかを返します。
 * @param {string} siteId - 現場ID
 * @returns {Promise<boolean>} - 現場取極めが存在すれば true, 存在しなければ false を返します。
 * @throws {Error} - Firestore からのドキュメント取得処理が失敗した場合にエラーがスローされます。
 */
async function isSiteContractExist(siteId) {
  try {
    const colRef = firestore.collection('SiteContracts')
    const queryRef = colRef.where('siteId', '==', siteId).limit(1)
    const querySnapshot = await queryRef.get()
    return !querySnapshot.empty
  } catch (err) {
    const message = `isSiteContractExist: Firestore クエリ処理中にエラーが発生しました。`
    logger.error(message, { siteId, error: err.message })
    throw new Error(message)
  }
}

/**
 * 指定された現場ドキュメントの hasContract フィールドを更新します。
 * @param {string} siteId - 更新対象の現場ID
 * @param {boolean} value - hasContract フィールドに設定する値
 * @returns {Promise<void>} - 更新が完了すると解決される Promise
 * @throws {Error} - Firestore の更新処理中にエラーが発生した場合にエラーがスローされます。
 */
async function updateSiteHasContract(siteId, value) {
  try {
    const docRef = firestore.collection('Sites').doc(siteId)
    await docRef.update({ hasContract: value })
  } catch (err) {
    const message = `updateSiteHasContract: Firestore クエリ処理中にエラーが発生しました。`
    logger.error(message, { siteId, value, error: err.message })
    throw new Error(message)
  }
}
