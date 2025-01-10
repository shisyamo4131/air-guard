<script>
/**
 * ARenderlessArrayManager を拡張したドキュメント群管理用共有コンポーネントです。
 * ドキュメント編集用のダイアログを内包しています。
 * @author shisyamo4131
 */
import { FireModel } from 'air-firebase'
import ARenderlessArrayManager from '../atoms/renderless/ARenderlessArrayManager.vue'
import GDialogInput from '../molecules/dialogs/GDialogInput.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { ARenderlessArrayManager, GDialogInput },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * ダイアログコンポーネントに引き渡されるプロパティです。
     */
    dialogProps: { type: Object, default: () => {}, required: false },

    /**
     * 管理対象のドキュメントの配列です。
     */
    docs: { type: Array, default: () => [], required: false },

    /**
     * ドキュメントを一意に識別するためのキーとなるプロパティ名です。
     */
    docKey: { type: String, default: 'docId', required: false },

    /**
     * ドキュメントのデータモデルが定義されたクラスのインスタンスです。
     * - FireModel を継承したクラスインスタンスである必要があります。
     * - 編集対象のインスタンスである data.editModel の初期化処理に使用されます。
     */
    instance: {
      type: Object,
      required: true,
      validator: (instance) => instance instanceof FireModel,
    },
  },

  methods: {
    /**
     * ダイアログの input イベントを処理します。
     * - callBack には ARenderlessArrayManager の quitEditing メソッドを受け取ります。
     * - input イベントのペイロードが false の場合のみ quitEditing メソッドを実行します。
     */
    _closeDialog(event, callBack) {
      if (!event) callBack()
    },
  },
}
</script>

<template>
  <a-renderless-array-manager
    :items="docs"
    :schema="instance"
    :item-key="docKey"
  >
    <template #default="props">
      <div>
        <slot
          name="default"
          v-bind="{
            attrs: { docs: props.items, docKey },
            on: {
              'click:regist': props.toRegist,
              'click:edit': props.toUpdate,
              'click:delete': props.toDelete,
            },
            docs,
          }"
        />
        <g-dialog-input
          v-bind="dialogProps"
          :value="props.isEditing"
          :edit-mode="props.editMode"
          :instance="props.editItem"
          @update:editMode="props.toggleEditMode"
          @input="($event) => _closeDialog($event, props.quitEditing)"
        >
          <template #default="{ attrs, on }">
            <slot name="editor" v-bind="{ attrs, on }" />
          </template>
        </g-dialog-input>
      </div>
    </template>
  </a-renderless-array-manager>
</template>

<style></style>
