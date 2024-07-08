/**
 * ### air-guard.js
 *
 * MS-Access版AirGuardのデータをFirestoreのドキュメントに同期させるためのCloud Functionsモジュール。
 *
 * 機能詳細:
 * - アプリ側からMS-Access版AirGuardのCSVデータをRealtimeDatabaseに取り込みます。
 * - 更新トリガーを利用してFirestoreのドキュメントを更新します。
 * - 2024-07-05現在、同期可能なコレクションはCustomersのみ。
 *
 * 注意事項:
 * - 更新トリガーでデータの更新を監視し、更新されたデータがdocIdを保有していればFirestoreドキュメントと同期します。
 * - RealtimeDatabaseの各データのdocIdはアプリ側から更新します。（Firestoreドキュメントとの関連付けを行う）
 * - 同期時、`sync`プロパティは強制的にtrueに更新されます。-> Firestore側から同期済みデータを判断するため。
 * - docIdがないデータはFirestoreドキュメントと同期されません。
 * - 上記を理由に、作成トリガーでの処理はありません。
 * - RealtimeDatabaseのデータが削除されてもFirestoreドキュメントには影響させません。
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * 更新履歴:
 * version 1.1.0 - 2024-07-08 - Customerモデルの`sync`プロパティ追加に伴ってcustomerUpdatedを更新
 *                              -> `sync`を強制的にtrueに更新するように変更。
 *
 * version 1.0.0 - 2024-07-05 - 初版作成
 *
 * NOTE:
 * - RealtimeDatabaseのデータをFirestoreドキュメントのオブジェクトに変換するコードを切り分けられるか。
 *   -> アプリ側のモデル定義をそのまま流用できれば便利だが、小数や真偽値のプロパティは個別にコンバートする必要がある。
 *   -> アプリ側のモデル定義を直接読み込むことは不可能。
 */
const { getFirestore } = require('firebase-admin/firestore')
const { info, error } = require('firebase-functions/logger')
const { onValueUpdated } = require('firebase-functions/v2/database')
const firestore = getFirestore()

/**
 * `AirGuard/Customers/{code}`が更新された時の処理です。
 * 対象データが有効なdocIdを保有していた場合、対象のFirestoreドキュメントと同期します。
 */
exports.customerUpdated = onValueUpdated(
  { ref: `/AirGuard/Customers/{code}`, region: 'us-central1' },
  async (event) => {
    const data = event.data.after.val()
    info(`[air-guard.js] Customerデータの更新を検知しました。`, {
      code: data.code,
      name1: data.name1,
      name2: data.name2,
    })
    try {
      const docId = data.docId
      if (!docId) {
        info(`[air-guard.js] docIdが設定されていないため、処理を終了します。`)
        return
      }
      info(`[air-guard.js] Firestoreドキュメントと同期します。`, { docId })
      const item = {
        name1: data.name1,
        name2: data.name2,
        abbr: data.abbr,
        abbrKana: data.abbrKana,
        zipcode: data.zipcode,
        address1: data.address1,
        address2: data.address2,
        tel: data.tel,
        fax: data.fax,
        status: data.status,
        deadline: data.deadline,
        depositMonth: parseInt(data.depositMonth),
        depositDate: data.depositDate,
        remarks: data.remarks,
        sync: true,
      }
      const docRef = firestore.collection('Customers').doc(docId)
      await docRef.set(item, { merge: true })
      info('Firestoreドキュメントとの同期が正常に完了しました。', { docId })
    } catch (err) {
      error(err)
    }
  }
)
