const { getFirestore } = require('firebase-admin/firestore')
const FireModel = require('./FireModel')
const { classProps } = require('./propsDefinition/EmployeeSiteActivity')
const firestore = getFirestore()
/**
 * EmployeeSiteActivitiesドキュメントデータモデル【物理削除】
 *
 * - 従業員の現場初回入場日、最終入場日を管理するデータモデルです。
 *
 * @version 1.0.0
 * @author shisyamo4131
 * @updates
 * - version 1.0.0 - 2024-09-25 - 初版作成
 */
class EmployeeSiteActivity extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'EmployeeSiteActivities'
  static classProps = classProps

  static async updateOnOperationResultDeleted(
    employeeId,
    siteId,
    operationResult
  ) {
    // `EmployeeSiteActivities` インスタンスを用意してドキュメントを読み込む
    const instance = new this()
    const docId = `${employeeId}-${siteId}`
    const isExist = await instance.fetch(docId)

    // `EmployeeSiteActivities` ドキュメントが存在しなければエラーをスローして終了
    if (!isExist) {
      throw new Error(
        `EmployeeSiteActivities ドキュメントが存在しません。ドキュメントIDは ${docId} です。`
      )
    }

    const { docId: operationResultId } = operationResult

    // `firstOperationResultId` および `lastOperationResultId` が `operationResultId` と一致しなければ終了
    if (
      instance.firstOperationResultId !== operationResultId &&
      instance.lastOperationResultId !== operationResultId
    ) {
      return
    }

    // `firstOperationResultId` と `lastOperationResultId` が `operationResultId` と一致すればドキュメントを削除して終了
    if (
      instance.firstOperationResultId === operationResultId &&
      instance.lastOperationResultId === operationResultId
    ) {
      await instance.delete()
      return
    }

    // `firstOperationResultId` が `operationResultId` と一致する場合
    if (instance.firstOperationResultId === operationResultId) {
      // 初回日の `operationResults` ドキュメントを取得
      const querySnapshot = await firestore
        .collection('OperationResults')
        .where('siteId', '==', siteId)
        .where('employeeIds', 'array-contains', employeeId)
        .orderBy('date')
        .limit(1)
        .get()

      // ドキュメントが存在しなければ `EmployeeSiteActivities` ドキュメントを削除して終了
      // -> ドキュメントが存在しない場合、初回日と最終日が一致していたはずなので、
      //    `operationResultId` と一致していた場合の処理で削除されるはず
      if (querySnapshot.empty) {
        await instance.delete()
        return
      }

      // ドキュメントが存在すれば初回日を更新
      const newFirstDoc = querySnapshot.docs[0]
      instance.firstDate = newFirstDoc.data().date
      instance.firstOperationResultId = newFirstDoc.id
    }

    // `lastOperationResultId` が `operationResultId` と一致する場合
    if (instance.lastOperationResultId === operationResultId) {
      // 最終日の `operationResults` ドキュメントを取得
      const querySnapshot = await firestore
        .collection('OperationResults')
        .where('siteId', '==', siteId)
        .where('employeeIds', 'array-contains', employeeId)
        .orderBy('date', 'desc')
        .limit(1)
        .get()

      // ドキュメントが存在しなければ `EmployeeSiteActivities` ドキュメントを削除して終了
      // -> ドキュメントが存在しない場合、初回日と最終日が一致していたはずなので、
      //    `operationResultId` と一致していた場合の処理で削除されるはず
      if (querySnapshot.empty) {
        await instance.delete()
        return
      }

      // ドキュメントが存在すれば最終日を更新
      const newLastDoc = querySnapshot.docs[0]
      instance.lastDate = newLastDoc.data().date
      instance.lastOperationResultId = newLastDoc.id
    }

    await instance.update()
  }
}

module.exports = EmployeeSiteActivity
