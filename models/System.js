import { FireModel, firestore } from 'air-firebase'
import { doc, updateDoc } from 'firebase/firestore'
import { classProps } from './propsDefinition/System'

/**
 * Systemsドキュメントデータモデル
 *
 * - システムの状態を表す Firestore ドキュメントのデータモデルです。
 * - アプリ側での操作を制限するため、CUD メソッドを削除しています。
 *
 * @version 1.0.0
 * @author shisyamo4131
 * @updates
 * - version 1.0.0 - 2024-10-15 - 初版作成
 */
export default class System extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'Systems'
  static classProps = classProps

  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)

    delete this.create
    delete this.update
    delete this.delete
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

  /****************************************************************************
   * 各種ステータスを編集
   ****************************************************************************/
  fromFirestore(snapshot) {
    const data = snapshot.data()
    const calcMonthlySales = {
      error: data?.calcMonthlySales?.error || null,
      executeStatus: data?.calcMonthlySales?.executeStatus || null,
      lastExecutedAt: data?.calcMonthlySales?.lastExecutedAt?.toDate
        ? data.calcMonthlySales.lastExecutedAt.toDate()
        : null,
      status: data?.calcMonthlySales?.status || 'ready',
    }
    return {
      ...super.fromFirestore(snapshot),
      calcMonthlySales,
    }
  }
}
