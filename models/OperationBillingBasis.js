import { FireModel } from 'air-firebase'
import { classProps, customClassMap } from './propsDefinition/OperationResult'
/**
 * 請求稼働実績データモデル
 *
 * - 稼働実績のデータモデルを請求業務の視点で管理するための特殊なモデルです。
 * - ドキュメントは `OperationResults` を使用します。
 * - Create、Deleteはできません。
 * ‐ `OperationResult` クラスでは `OperationWorkResults` ドキュメントを同期させるために `update` メソッドをオーバーライドして独自の処理を実装していますが、
 *   `OperationBillingBasis` クラスでは `OperationWorkResults` ドキュメントに影響する更新は行わない（行わせない）ため、
 *   オーバーライドしていません。
 *
 * @author shisyamo4131
 * @refact 2025-01-25
 */
export default class OperationBillingBasis extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'OperationResults'
  static useAutonumber = true
  static classProps = classProps

  /****************************************************************************
   * CUSTOM CLASS MAPPING
   ****************************************************************************/
  static customClassMap = customClassMap

  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)

    // Object.defineProperties(this, {
    //   sales: {
    //     configurable: true,
    //     enumerable: true,
    //     get() {
    //       const result = {
    //         standard: {
    //           normal: 0,
    //           half: 0,
    //           cancel: 0,
    //           total: 0,
    //           overtime: 0,
    //         },
    //         qualified: {
    //           normal: 0,
    //           half: 0,
    //           cancel: 0,
    //           total: 0,
    //           overtime: 0,
    //         },
    //         total: 0,
    //       }

    //       // unitPriceとoperationCountの存在をチェック
    //       if (!this.unitPrice || !this.operationCount) return result

    //       // スタンダード料金の計算
    //       result.standard.normal =
    //         (this.operationCount.standard?.normal || 0) *
    //         (this.unitPrice.standard?.normal || 0)
    //       result.standard.half =
    //         (this.operationCount.standard?.half || 0) *
    //         (this.unitPrice.standard?.half || 0)
    //       result.standard.cancel =
    //         (this.operationCount.standard?.cancel || 0) *
    //         (this.unitPrice.standard?.cancel || 0)
    //       result.standard.overtime =
    //         ((this.operationCount.standard?.overtimeMinutes || 0) / 60) *
    //         (this.unitPrice.standard?.overtime || 0)

    //       // 有資格者料金の計算
    //       result.qualified.normal =
    //         (this.operationCount.qualified?.normal || 0) *
    //         (this.unitPrice.qualified?.normal || 0)
    //       result.qualified.half =
    //         (this.operationCount.qualified?.half || 0) *
    //         (this.unitPrice.qualified?.half || 0)
    //       result.qualified.cancel =
    //         (this.operationCount.qualified?.cancel || 0) *
    //         (this.unitPrice.qualified?.cancel || 0)
    //       result.qualified.overtime =
    //         ((this.operationCount.qualified?.overtimeMinutes || 0) / 60) *
    //         (this.unitPrice.qualified?.overtime || 0)

    //       // 合計を計算
    //       result.standard.total =
    //         result.standard.normal +
    //         result.standard.half +
    //         result.standard.cancel +
    //         result.standard.overtime
    //       result.qualified.total =
    //         result.qualified.normal +
    //         result.qualified.half +
    //         result.qualified.cancel +
    //         result.qualified.overtime

    //       result.total = result.standard.total + result.qualified.total

    //       return result
    //     },
    //     set(v) {},
    //   },
    // })
  }

  /****************************************************************************
   * create, delete メソッドは使用不可
   ****************************************************************************/
  create() {
    return Promise.reject(
      new Error('このクラスの create メソッドは使用できません。')
    )
  }

  delete() {
    return Promise.reject(
      new Error('このクラスの delete メソッドは使用できません。')
    )
  }

  /****************************************************************************
   * ADDED PROPERTIES
   ****************************************************************************/

  /**
   * 資格なしの残業時間を時間単位で管理します。
   */
  // get overtimeHoursStandard() {
  //   return this.operationCount.standard.overtimeMinutes / 60
  // }

  // set overtimeHoursStandard(value) {
  //   this.operationCount.standard.overtimeMinutes = value * 60
  // }

  // /**
  //  * 資格ありの残業時間を時間単位で管理します。
  //  */
  // get overtimeHoursQualified() {
  //   return this.operationCount.qualified.overtimeMinutes / 60
  // }

  // set overtimeHoursQualified(value) {
  //   this.operationCount.qualified.overtimeMinutes = value * 60
  // }

  /**
   * Overrides FireModel's `beforeUpdate`.
   * - Recalculate `operationCount`.
   * @returns {Promise<void>}
   */
  // beforeUpdate() {
  //   return new Promise((resolve) => {
  //     this.operationCount.standard.total =
  //       this.operationCount.standard.normal +
  //       this.operationCount.standard.half +
  //       this.operationCount.standard.cancel
  //     this.operationCount.qualified.total =
  //       this.operationCount.qualified.normal +
  //       this.operationCount.qualified.half +
  //       this.operationCount.qualified.cancel
  //     this.operationCount.total =
  //       this.operationCount.standard.total + this.operationCount.qualified.total
  //     this.operationCount.overtimeMinutes =
  //       this.operationCount.standard.overtimeMinutes +
  //       this.operationCount.qualified.overtimeMinutes

  //     resolve() // 非同期処理が完了したことを通知
  //   })
  // }
}
