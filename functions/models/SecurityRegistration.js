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
    this.registrationDate = item.registrationDate ?? ''
    this.securityStartDate = item.securityStartDate ?? ''
    this.blankMonths = item.blankMonths ?? 0
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
