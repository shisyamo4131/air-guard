/**
 * 警備員登録情報データモデル
 * - Employee クラスで使用されます。
 * @author shisyamo4131
 */
export default class SecurityRegistration {
  /***************************************************************************
   * CONSTRUCTOR
   ***************************************************************************/
  constructor(item = {}) {
    // 警備員登録日
    this.registrationDate = item.registrationDate ?? ''

    // 警備経験開始日
    this.securityStartDate = item.securityStartDate ?? ''

    // ブランク
    this.blankMonths = item.blankMonths ?? 0

    // 本籍地
    this.honseki = item.honseki ?? ''

    // 緊急連絡先氏名
    this.emergencyContactName = item.emergencyContactName ?? ''

    // 緊急連絡先続柄
    this.emergencyContactRelation = item.emergencyContactRelation ?? ''

    // 緊急連絡先続柄詳細
    this.emergencyContactRelationDetail =
      item.emergencyContactRelationDetail ?? ''

    // 緊急連絡先住所
    this.emergencyContactAddress = item.emergencyContactAddress ?? ''

    // 緊急連絡先電話番号
    this.emergencyContactTel = item.emergencyContactTel ?? ''
  }

  toObject() {
    return { ...this }
  }

  /***************************************************************************
   * 警備経験年月を返します。
   ***************************************************************************/
  get experiencePeriod() {
    if (!this.securityStartDate) {
      return { years: 0, months: 0 }
    }

    const startDate = new Date(this.securityStartDate)
    const currentDate = new Date()

    let totalMonths = (currentDate.getFullYear() - startDate.getFullYear()) * 12
    totalMonths += currentDate.getMonth() - startDate.getMonth()
    totalMonths -= this.blankMonths

    if (totalMonths < 0) {
      return { years: 0, months: 0 }
    }

    const years = Math.floor(totalMonths / 12)
    const months = totalMonths % 12

    return { years, months }
  }
}
