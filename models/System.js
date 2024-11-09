import { FireModel, firestore } from 'air-firebase'
import { doc, updateDoc } from 'firebase/firestore'
import { classProps } from './propsDefinition/System'

/**
 * ## 各種実行記録のカスタムクラス
 */
class ExecuteStatus {
  constructor(item = {}) {
    this.status = item?.status || 'ready'
    this.lastExecutedAt = item?.lastExecutedAt?.toDate
      ? item.lastExecutedAt.toDate()
      : item?.lastExecutedAt || null
    this.executeStatus = item?.executeStatus || null
    this.error = item?.error || null
  }

  toObject() {
    return { ...this }
  }
}

/**
 * ## Systemsドキュメントデータモデル
 *
 * - システムの状態を表す Firestore ドキュメントのデータモデルです。
 * - アプリ側での操作を制限するため、CUD メソッドを削除しています。
 *
 * @author shisyamo4131
 */
export default class System extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'Systems'
  static classProps = classProps

  /****************************************************************************
   * CUSTOM CLASS MAPPING
   ****************************************************************************/
  static customClassMap = {
    calcAttendance: ExecuteStatus,
    calcMonthlySales: ExecuteStatus,
    calcSiteBillings: ExecuteStatus,
    refreshEmployeeSiteHistory: ExecuteStatus,
    refreshSiteEmployeeHistory: ExecuteStatus,
  }

  /****************************************************************************
   * System ドキュメントを作成します。
   * - 唯一のドキュメントであり、ドキュメントIDは `System` に固定されます。
   *
   * @returns {Promise<DocumenntReference>} - 作成された System ドキュメントへの参照
   ****************************************************************************/
  async create() {
    try {
      return await super.create({ docId: 'System' })
    } catch (err) {
      const message = `[create] System ドキュメントの作成に失敗しました。`
      // eslint-disable-next-line no-console
      console.error(message, err)
      throw err
    }
  }

  /****************************************************************************
   * System ドキュメントを自身のインスタンスに読み込みます。
   * @returns {Promise<boolean>} - 読み込みに成功すると true を、失敗すると false を返します。
   ****************************************************************************/
  async fetch() {
    try {
      return await super.fetch(`System`)
    } catch (err) {
      const message = `[fetch] System ドキュメントの読み込みに失敗しました。`
      // eslint-disable-next-line no-console
      console.error(message, err)
      throw err
    }
  }

  /****************************************************************************
   * calcAttendance ステータスを 'ready' に初期化するメソッドです。
   * - Firestore の `Systems` コレクションにある `System` ドキュメントの
   *   `calcAttendance.status` フィールドを 'ready' に更新します。
   * - このメソッドは、システムの状態を初期化したい場合に使用されます。
   *
   * @throws {Error} Firestore ドキュメントの更新中にエラーが発生した場合、エラーがスローされます。
   ****************************************************************************/
  static async initCalcAttendanceStatus() {
    const docRef = doc(firestore, 'Systems', 'System') // 'Systems' コレクション内の 'System' ドキュメントを参照
    try {
      // calcAttendance.status を 'ready' に更新
      await updateDoc(docRef, { 'calcAttendance.status': 'ready' })

      // 正常終了のログを出力
      // eslint-disable-next-line no-console
      console.info(
        `[initCalcAttendanceStatus] calcAttendance.status の初期化処理が正常に完了しました。`
      )
    } catch (err) {
      // エラーログを出力し、エラーをスロー
      // eslint-disable-next-line no-console
      console.error(
        `[initCalcAttendanceStatus] calcAttendance.status の初期化処理で不明なエラーが発生しました。`,
        { err }
      )
      throw err
    }
  }
}
