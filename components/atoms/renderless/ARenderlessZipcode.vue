<script>
import adapter from 'axios-jsonp'
/**
 * ## ARenderlessZipcode
 * 郵便番号から住所を取得する機能をコンポーネントに提供するための
 * レンダーレスコンポーネントです。
 *
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * MODEL
   ***************************************************************************/
  model: {
    prop: 'value',
    event: 'input',
  },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    value: { type: String, default: '', required: false },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      loading: false,
    }
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    async fetch(zipcode) {
      if (!zipcode || zipcode.length !== 7) return
      if (this.loading) return
      try {
        this.loading = true
        const result = await this.getAddress(zipcode)
        const pref = result.address1
        const city = result.address2
        const addr = result.address3
        const prefCode = result.prefcode
        const full = result.address1 + result.address2 + result.address3
        this.$emit('loaded', { pref, city, addr, prefCode, full })
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        alert(err.message)
      } finally {
        this.loading = false
      }
    },
    async getAddress(zipcode) {
      const uri = 'https://zipcloud.ibsnet.co.jp/api/search'
      const params = { zipcode }
      const res = await this.$axios.$get(uri, { adapter, params })
      if (res.status !== 200) throw new Error(res.message)
      if (!res.results) throw new Error('該当する住所がありませんでした。')
      const result = Array.isArray(res.results) ? res.results[0] : res.results
      /* eslint-disable */
      console.info(`住所の取得に成功しました。`)
      console.table(result)
      /* eslint-enable */
      return result
    },
  },
  /***************************************************************************
   * RENDER
   ***************************************************************************/
  render() {
    return this.$scopedSlots.default({
      attrs: {
        disabled: this.loading,
        loading: this.loading,
        value: this.value,
      },
      on: {
        change: ($event) => this.fetch($event),
        input: ($event) => this.$emit('input', $event),
      },
    })
  },
}
</script>
