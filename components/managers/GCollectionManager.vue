<script>
/**
 * コレクションドキュメントを追加・変更・削除するための共通設定を施した
 * AirArrayManager です。
 * - インスタンスを指定するのみで指定されたコレクションドキュメントの管理機能を提供します。
 * @author shisyamo4131
 * @refact 2025-02-06
 */
import { FireModel } from 'air-firebase'
import AirArrayManager from '../air/AirArrayManager.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { AirArrayManager },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * ドキュメントの追加処理を上書きします。
     * (item) => Promise<void>
     */
    handleCreate: {
      type: Function,
      default: async (item) => await item.create(),
      validator: (v) => !v || typeof v === 'function',
    },

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
}
</script>

<template>
  <air-array-manager
    v-bind="$attrs"
    :handle-create="handleCreate"
    :handle-update="handleUpdate"
    :handle-delete="handleDelete"
    :schema="instance"
    v-on="$listeners"
  >
    <template
      v-for="(_, scopedSlotName) in $scopedSlots"
      #[scopedSlotName]="slotData"
    >
      <slot :name="scopedSlotName" v-bind="slotData" />
    </template>
  </air-array-manager>
</template>

<style></style>
