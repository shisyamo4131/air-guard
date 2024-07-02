<script>
/**
 * ### GCrudFireModel
 *
 * 2024-07-02時点で作成してみたものの、未使用。
 * DialogEditorXXXが増えていくのを敬遠して作ってみたが、結局状態管理などを含む処理を画一化させようとすればするほど
 * コンポーネントの実装が複雑になっていく。
 * シンプルなコンポーネントを積み上げていった結果、使用するかもしれない？
 *
 * 概要:
 * FireModeを継承した各種データモデルのCreate、Read（Fetch）、Update、Delete機能を
 * 提供するレンダーレスコンポーネントです。
 * 唯一提供されるdefaultスロットにInputコンポーネントを配置して使用してください。
 *
 * 機能詳細:
 * - `props.modelId`に指定されたデータモデルを読み込み、Inputコンポーネントとデータバインドするためのスロットプロパティを提供します。
 * - `props.defaultItem`を使用して、データモデルの初期化時に各プロパティの初期値を指定できます。
 * - `props.customSubmit`を使用して、既定のsubmit処理を変更することができます。
 *
 * @props
 * @prop {function} customSubmit - 既定のsubmit処理を上書きします。
 * @prop {object} defaultItem - データモデルの初期化時に適用されるプロパティの初期値です。
 * @prop {string} modelId - 使用するデータモデルの名前です。
 *
 * @slots
 * @slot default - 以下のスロットプロパティを提供します。
 * - attrs、on: Inputコンポーネントとデータバインドを実装するためのプロパティです。
 * - loading: このコンポーネントが処理中であることを表します。
 * ‐ fetch: データモデルのfetch()を呼び出します。
 * - init: データモデルを初期化する関数です。
 * - submit: submit処理を実行します。
 *
 * @events
 * @event submit:complete - submit処理が正常に終了するとemitされます。
 * @event submit:error - submit処理に異常が発生するとemitされます。
 *
 * @author shisyamo4131
 * @create 2024-07-02
 * @version 1.0.0
 */
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    customSubmit: { type: Function, default: undefined, required: false },
    defaultItem: { type: Object, default: () => ({}), required: false },
    modelId: { type: String, required: true },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      loading: false,
      model: null,
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    attrs() {
      return {
        ...Object.keys(this.model || {}).reduce((acc, i) => {
          acc[i] = this.model[i]
          return acc
        }, {}),
        editMode: this.editMode,
      }
    },
    on() {
      /**
       * 引数で受け取ったオブジェクトのプロパティをすべて列挙して配列で返します。
       * ネストされたプロパティに対応するため、再帰的に呼び出されます。
       */
      const getAllProperties = (obj, prefix = '') => {
        let properties = []
        for (const key in obj) {
          if (Object.hasOwn(obj, key)) {
            const propName = prefix ? `${prefix}.${key}` : key
            properties.push(propName)
            if (typeof obj[key] === 'object' && obj[key] !== null) {
              properties = properties.concat(
                getAllProperties(obj[key], propName)
              )
            }
          }
        }
        return properties
      }
      // modelのネストされたものも含めたすべてのプロパティを配列として取得します。
      const props = getAllProperties(this.model)
      return props.reduce((acc, i) => {
        /**
         * すべてのプロパティに対するupdateイベントを生成します。
         * - updateイベントの`:`以降はドットを受け付けないため`-'に置換します。
         */
        acc[`update:${i.replace(/\./g, '-')}`] = ($event) => {
          const keys = i.split('.')
          let current = this.model
          keys.slice(0, -1).forEach((key) => {
            if (!current[key]) current[key] = {} // Probably unnecessary.
            current = current[key]
          })
          current[keys[keys.length - 1]] = $event
        }
        return acc
      }, {})
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    modelId: {
      handler(newVal, oldVal) {
        if (newVal === oldVal) return
        this.model = this[`$${newVal}`]()
        this.initialize()
      },
      immediate: true,
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    async fetch(docId) {
      this.loading = true
      try {
        await this.model.fetch(docId)
        this.$emit('fetch:complete', structuredClone(this.model))
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        alert(err.message)
        this.$emit('fetch:error', err)
      }
      this.loading = false
    },
    initialize(item = {}, callback = undefined) {
      this.model.initialize({
        ...JSON.parse(JSON.stringify(this.defaultItem)),
        ...JSON.parse(JSON.stringify(item)),
      })
      !callback || callback()
      this.$emit('initialized')
    },
    async submit(mode) {
      this.loading = true
      try {
        if (this.customSubmit) {
          await this.customSubmit(this.model, mode)
        } else {
          await this.defaultSubmit(mode)
        }
        this.$emit('submit:complete', structuredClone(this.model))
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        alert(err.message)
        this.$emit('submit:error', err)
      } finally {
        this.loading = false
      }
    },
    async defaultSubmit(mode) {
      if (mode === 'REGIST') await this.model.create()
      if (mode === 'UPDATE') await this.model.update()
      if (mode === 'DELETE') await this.model.delete()
    },
  },
  /***************************************************************************
   * RENDER
   ***************************************************************************/
  render() {
    return this.$scopedSlots.default({
      attrs: this.attrs,
      on: this.on,
      loading: this.loading,
      fetch: this.fetch,
      init: this.initialize,
      submit: this.submit,
    })
  },
}
</script>
