<script>
/**
 * Firestore ドキュメントを 更新・削除するための共通設定を施した
 * AirItemManager です。
 * - ドキュメントID、インスタンスを指定するのみで指定されたドキュメントを読み込み、管理機能を提供します。
 * - ドキュメントの読み込み方法は type プロパティに subscribe, fetch のどちらかを指定します。
 * - fetch を選択した場合のみ、スロットプロパティで提供する loading が使用可能です。
 *
 * @author shisyamo4131
 * @refact 2025-02-12
 */
import { FireModel } from 'air-firebase'
import AirItemManager from '../air/AirItemManager.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { AirItemManager },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * 管理対象ドキュメントの ID です。
     */
    docId: { type: String, default: undefined, required: false },

    /**
     * ドキュメントの変更処理を上書きします。
     * (item) => Promise<void>
     */
    handleUpdate: {
      type: Function,
      default: async (item) => await item.update(),
      validator: (v) => !v || typeof v === 'function',
    },

    /**
     * ドキュメントの削除処理を上書きします。
     * (item) => Promise<void>
     */
    handleDelete: {
      type: Function,
      default: async (item) => await item.delete(),
      validator: (v) => !v || typeof v === 'function',
    },

    /**
     * 管理対象ドキュメントのデータモデルを定義したクラスのインスタンスです。
     * FireModel を継承している必要があります。
     */
    instance: {
      type: Object,
      required: true,
      validator: (v) => v instanceof FireModel,
    },

    /**
     * インスタンスにドキュメントを読み込む方法を指定します。
     * subscribe: リアルタイムリスナーによる購読を開始します。
     * fetch: 単発の読み込みを行います。
     */
    type: {
      type: String,
      default: 'subscribe',
      required: false,
      validator: (v) => ['subscribe', 'fetch'].includes(v),
    },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      internalLoading: false,
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    computedLoading: {
      get() {
        return this.internalLoading
      },
      set(v) {
        this.internalLoading = v
        this.$emit('loading', v)
      },
    },
  },

  /***************************************************************************
   * CREATED
   ***************************************************************************/
  created() {
    // docId, instance, type の組み合わせでウォッチャーを登録
    this.$watch(
      () => [this.docId, this.instance, this.type],
      (v) => {
        if (v[2] === 'subscribe') this.subscribe()
        if (v[2] === 'fetch') this.fetch()
      },
      { immediate: true }
    )
  },

  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.unsubscribe()
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * ドキュメントをインスタンスに読み込みます。
     */
    async fetch() {
      if (!this.docId || !this.instance) return
      this.computedLoading = true
      try {
        await this.instance.fetch(this.docId)
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err.message)
      } finally {
        this.computedLoading = false
      }
    },

    /**
     * ドキュメントの購読を開始します。
     */
    subscribe() {
      if (!this.docId || !this.instance) return
      this.instance.subscribe(this.docId)
    },

    /**
     * ドキュメントの購読を解除します。
     */
    unsubscribe() {
      if (this.instance?.unsubscribe) {
        this.instance.unsubscribe()
      }
    },
  },
}
</script>

<template>
  <air-item-manager
    v-bind="{ ...$attrs, ...$props }"
    :item="instance"
    v-on="$listeners"
  >
    <template
      v-for="(_, scopedSlotName) in $scopedSlots"
      #[scopedSlotName]="slotData"
    >
      <slot
        :name="scopedSlotName"
        v-bind="{ ...slotData, loading: computedLoading }"
      />
    </template>
  </air-item-manager>
</template>

<style></style>
