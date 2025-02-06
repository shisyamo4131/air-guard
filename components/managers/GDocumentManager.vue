<script>
/**
 * Firestore ドキュメントを 更新・削除するための共通設定を施した
 * AirItemManager です。
 * - ドキュメントID、インスタンスを指定するのみで指定されたドキュメントの管理機能を提供します。
 * @author shisyamo4131
 * @refact 2025-02-06
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
    docId: { type: String, required: true },

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
  },

  /***************************************************************************
   * CREATED
   ***************************************************************************/
  created() {
    // docId, instance の組み合わせでウォッチャーを登録
    this.$watch(
      () => [this.docId, this.instance],
      (v) => this.subscribe(),
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
      <slot :name="scopedSlotName" v-bind="slotData" />
    </template>
  </air-item-manager>
</template>

<style></style>
