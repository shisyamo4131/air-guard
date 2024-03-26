export default class SiteDaylySales {
  constructor(date, site) {
    this.date = date
    this.siteId = site?.docId || ''
    this.customerId = site?.customer?.docId || ''
    this.total = 0
    this.workers = {
      standard: { normal: 0, half: 0, canceled: 0 },
      qualified: { normal: 0, half: 0, canceled: 0 },
    }
    Object.defineProperties(this, {
      year: {
        enumerable: true,
        get() {
          return this.date ? this.date.substring(0, 4) : ''
        },
        set(v) {},
      },
      month: {
        enumerable: true,
        get() {
          return this.date ? this.date.substring(0, 7) : ''
        },
        set(v) {},
      },
    })
  }
}
