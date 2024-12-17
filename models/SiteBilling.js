import { FireModel } from 'air-firebase'
import { getApp } from 'firebase/app'
import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
} from 'firebase/functions'
import dayjs from 'dayjs'
import { classProps } from './propsDefinition/SiteBilling'
import OperationResultForSiteBilling from './OperationResultForSiteBilling'

/**
 * 現場請求ドキュメントデータモデル
 * @author shisyamo4131
 */
export default class SiteBilling extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'SiteBillings'
  static classProps = classProps

  /****************************************************************************
   * CUSTOM CLASS MAPPING
   ****************************************************************************/
  static customClassMap = {
    operationResults: OperationResultForSiteBilling,
  }

  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)
    delete this.tokenMap
  }

  /****************************************************************************
   * 更新系メソッドは使用不可
   ****************************************************************************/
  create() {
    return Promise.reject(new Error('このクラスの create は使用できません。'))
  }

  update() {
    return Promise.reject(new Error('このクラスの update は使用できません。'))
  }

  delete() {
    return Promise.reject(new Error('このクラスの delete は使用できません。'))
  }

  /****************************************************************************
   * 指定した年月の現場請求ドキュメントを再計算します。
   * - ローカル環境では Functions エミュレータを使用します。
   *
   * @param {string} month - 対象の年月（フォーマット: YYYY-MM）
   * @returns {Promise<object>} - Cloud Functions の実行結果を含む Promise
   * @throws {Error} - `month` の形式が不正な場合にエラーをスローします。
   ****************************************************************************/
  static async recalc(month) {
    // month のバリデーション: YYYY-MM形式をチェック
    if (
      !/^\d{4}-\d{2}$/.test(month) ||
      !dayjs(month, 'YYYY-MM', true).isValid()
    ) {
      throw new Error(
        `[recalc] Invalid month format: ${month}. Expected format is YYYY-MM.`
      )
    }

    const functions = getFunctions(getApp(), 'asia-northeast1')

    // ローカル環境の場合、Functions エミュレータに接続
    if (process.env.NODE_ENV === 'local') {
      connectFunctionsEmulator(functions, 'localhost', 5001)
    }

    // Cloud Functions を呼び出して現場請求ドキュメントを更新
    const func = httpsCallable(functions, 'maintenance-refreshSiteBillings')
    return await func({ month })
  }
}
