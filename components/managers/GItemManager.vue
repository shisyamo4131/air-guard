<script>
/**
 * AirItemManager を拡張したデータ表示・編集のためのコンポーネントです。
 * @author shisyamo4131
 * @refact 2025-01-17
 */
import AirItemManager from '../air/AirItemManager.vue'
import GBtnDelete from '../atoms/btns/GBtnDelete.vue'
import GBtnEdit from '../atoms/btns/GBtnEdit.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GBtnEdit, AirItemManager, GBtnDelete },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * コンポーネントのカラーです。
     */
    color: { type: String, default: undefined, required: false },

    /**
     * アイテムの削除を開始するためのトリガーとなるボタンを表示します。
     */
    deletable: { type: Boolean, default: false, required: false },

    /**
     * アイテムの編集を開始するためのトリガーとなるボタンを表示します。
     */
    editable: { type: Boolean, default: false, required: false },

    /**
     * ボタンをアイコン表示にします。
     */
    icon: { type: Boolean, default: false, required: false },

    /**
     * カードコンポーネントのラベルです。
     * - ダイアログに表示されるラベルと共有されます。
     */
    label: { type: String, default: undefined, required: false },
  },
}
</script>

<template>
  <air-item-manager
    v-bind="$attrs"
    :color="color"
    :label="label"
    v-on="$listeners"
  >
    <!-- AirItemManager が提供するスロットを動的に用意 -->
    <template
      v-for="(_, scopedSlotName) in $scopedSlots"
      #[scopedSlotName]="slotData"
    >
      <slot :name="scopedSlotName" v-bind="slotData" />
    </template>

    <!-- default スロットのみカスタム -->
    <template #default="props">
      <v-card height="inherit">
        <v-toolbar class="flex-grow-0" :color="color" :dark="!!color" flat>
          <v-toolbar-title>{{ label }}</v-toolbar-title>
        </v-toolbar>

        <!-- アイテムを表示するためのスロット -->
        <slot name="default" v-bind="props" />

        <!-- アクションボタンの描画 -->
        <v-card-actions class="justify-end">
          <g-btn-edit
            v-if="editable"
            :color="color"
            :icon="icon"
            @click="() => props.on?.['click:edit']?.()"
          />
          <g-btn-delete
            v-if="deletable"
            :color="color"
            :icon="icon"
            @click="() => props.on?.['click:delete']?.()"
          />
        </v-card-actions>
      </v-card>
    </template>
  </air-item-manager>
</template>

<style></style>
