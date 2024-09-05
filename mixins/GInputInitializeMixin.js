/**
 * GInputInitializeMixin
 *
 * `GInput`を接頭辞として持つコンポーネントについて、以下の機能を提供するMixinsです。
 *
 * - `props.instance`で親コンポーネントからデータモデルを定義したクラスのインスタンスオブジェクトを受け取ります。
 * - 親コンポーネントから受け取ったインスタンスオブジェクトのクローンを`data.editModel`にセットします。
 * - `props.instance`が更新される都度、その内容を`data.editModel`に反映させます。
 * - `initialize()`を提供し、`data.editModel`の内容を`props.instance`で初期化します。
 *
 * オブジェクトのクローンである`data.editModel`を使用することで、オブジェクトプロパティとUIコンポーネントの
 * 双方向バインディングが可能です。
 *
 * 特定のクラスに依存するコンポーネントでは、以下の方法でこのMixinを利用することで、堅牢性を高めることができます：
 * - `props.instance` に対して `validator` を設定し、期待されるクラスのインスタンスであることを検証します。
 * - `data.editModel` を特定のクラスのインスタンスとしてオーバーライドし、クラスに依存した実装を明確にします。
 *
 * 使用例：
 * ‐ `GInput`コンポーネントでMixinsとして読み込み、`data.close`を必要なUIコンポーネントに紐づけます。
 *
 * @example
 * import SpecifiedClass from '~/models/SpecifiedClass'
 * import GInputInitializeMixin from '~/mixins/GInputInitializeMixin'
 *
 * export default {
 *   mixins: [GInputInitializeMixin],
 *   props: {
 *     instance: {
 *       type: Object,
 *       required: true,
 *       validator(obj) {
 *         return obj instanceof SpecifiedClass;
 *       }
 *     }
 *   },
 *   data() {
 *     return {
 *       editModel: new SpecifiedClass(), // 特定のクラスのインスタンスを使用
 *     }
 *   }
 * }
 *
 * @version 1.0.2
 * @creator shisyamo4131
 * @updates
 * - version 1.0.0 - 初版作成
 * - version 1.0.1 - 特定のクラスに依存する場合のオーバーライド方法に関するコメントを追加
 * - version 1.0.2 - `props.value`を`props.instance`に変更
 */

export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    instance: {
      type: Object,
      required: true,
    },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      editModel: new this.instance.constructor(), // `instance` オブジェクトを複製
    }
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    instance: {
      handler() {
        this.initialize() // `instance` の変更を監視し、必要に応じて `editModel` を初期化
      },
      deep: true, // `instance` 内部のプロパティが変更された場合にも対応
      immediate: true, // 初回マウント時にも `initialize` を呼び出す
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * `editModel` オブジェクトを `instance` に基づいて初期化します。
     * `instance` が `toObject` メソッドを持つ場合、そのメソッドを使用して `editModel` を初期化します。
     * 持たない場合は、そのまま `instance` を使用して初期化します。
     */
    initialize() {
      if (!this.editModel) {
        // eslint-disable-next-line no-console
        console.warn('Clone is not initialized. Initialization aborted.')
        return
      }
      if (typeof this.editModel.initialize !== 'function') {
        // eslint-disable-next-line no-console
        console.warn(
          'The editModel object does not have an initialize() method. No action will be taken.'
        )
        return
      }
      if (typeof this.instance.toObject === 'function') {
        this.editModel.initialize(this.instance.toObject())
      } else {
        // eslint-disable-next-line no-console
        console.warn(
          'The provided instance does not have a toObject() method. Using the instance as-is:',
          this.instance
        )
        this.editModel.initialize(this.instance)
      }
    },
  },
}
