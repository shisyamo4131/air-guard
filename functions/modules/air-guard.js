/**
 * ### air-guard.js
 *
 * MS-Access版AirGuardのデータをFirestoreのドキュメントに同期させるためのCloud Functionsモジュール。
 *
 * 機能詳細:
 * - アプリ側からMS-Access版AirGuardのCSVデータをRealtimeDatabaseに取り込みます。
 * - 更新トリガーを利用してFirestoreのドキュメントを更新します。
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
 * @version 1.2.0
 *
 * 更新履歴:
 * version 1.2.1 - 2024-07-11 - Siteの同期処理時に`customer`プロパティをセットするように修正。
 * version 1.2.0 - 2024-07-10 - Cloud Functions版FireModelの実装に伴ってデータモデルを使用するように修正。
 *                            - Siteの同期処理を実装。
 * version 1.1.1 - 2024-07-09 - Customerとの同期時、`code`が同期されていなかったのを修正。
 * version 1.1.0 - 2024-07-08 - Customerモデルの`sync`プロパティ追加に伴ってcustomerUpdatedを更新
 *                              -> `sync`を強制的にtrueに更新するように変更。
 * version 1.0.0 - 2024-07-05 - 初版作成
 *
 * NOTE:
 * - Siteの同期処理で、Customerが見つからなかった場合にnullがセットされるのに注意。
 *   -> アプリ側で制御するしかない。
 */
const { getFirestore } = require('firebase-admin/firestore')
const { info, error } = require('firebase-functions/logger')
const { onValueUpdated } = require('firebase-functions/v2/database')
const Customer = require('../models/Customer')
const Site = require('../models/Site')
const Employee = require('../models/Employee')
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
      const model = new Customer(data)
      model.depositMonth = parseInt(data.depositMonth)
      model.sync = true
      const docRef = firestore.collection('Customers').doc(docId)
      await docRef.set({ ...model }, { merge: true })
      info('Firestoreドキュメントとの同期が正常に完了しました。', { docId })
    } catch (err) {
      error(err)
    }
  }
)

/**
 * `AirGuard/Sites/{code}`が更新された時の処理です。
 * - 対象データが有効なdocIdを保有していた場合、対象のFirestoreドキュメントと同期します。
 * - 同期時、取引先ドキュメントを取得してセットします。
 * - 取引先が存在しなかった場合、`customer`プロパティは`null`になります。
 */
exports.siteUpdated = onValueUpdated(
  { ref: `/AirGuard/Sites/{code}`, region: 'us-central1' },
  async (event) => {
    const data = event.data.after.val()
    info(`[air-guard.js] Siteデータの更新を検知しました。`, {
      code: data.code,
      name: data.name,
    })
    const getCustomerByCode = async (code) => {
      const colRef = firestore.collection('Customers')
      const q = colRef.where('code', '==', code)
      const querySnapshot = await q.get()
      if (querySnapshot.empty) return null
      return querySnapshot.docs[0].data()
    }
    try {
      const docId = data.docId
      if (!docId) {
        info(`[air-guard.js] docIdが設定されていないため、処理を終了します。`)
        return
      }
      info(`[air-guard.js] Firestoreドキュメントと同期します。`, { docId })
      const model = new Site(data)
      model.customer = await getCustomerByCode(data.customerCode)
      model.sync = true
      const docRef = firestore.collection('Sites').doc(docId)
      await docRef.set({ ...model }, { merge: true })
      info('Firestoreドキュメントとの同期が正常に完了しました。', { docId })
    } catch (err) {
      error(err)
    }
  }
)

/**
 * `AirGuard/Employees/{code}`が更新された時の処理です。
 * 対象データが有効なdocIdを保有していた場合、対象のFirestoreドキュメントと同期します。
 */
exports.employeeUpdated = onValueUpdated(
  { ref: `/AirGuard/Employees/{code}`, region: 'us-central1' },
  async (event) => {
    const data = event.data.after.val()
    info(`[air-guard.js] Employeeデータの更新を検知しました。`, {
      code: data.code,
      name: `${data.lastName} ${data.firstName}`,
    })
    try {
      const docId = data.docId
      if (!docId) {
        info(`[air-guard.js] docIdが設定されていないため、処理を終了します。`)
        return
      }
      info(`[air-guard.js] Firestoreドキュメントと同期します。`, { docId })
      const model = new Employee(data)
      model.isForeigner = data.isForeigner === '1'
      model.hasSendAddress = data.hasSendAddress === '2'
      model.sync = true
      const docRef = firestore.collection('Employees').doc(docId)
      await docRef.set({ ...model }, { merge: true })
      info('Firestoreドキュメントとの同期が正常に完了しました。', { docId })
    } catch (err) {
      error(err)
    }
  }
)
