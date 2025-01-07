<script>
/**
 * ADocumentsManager を拡張したドキュメント群管理用共有コンポーネントです。
 * ドキュメント編集用のダイアログを内包しています。
 * @author shisyamo4131
 */
import { FireModel } from 'air-firebase'
import ADocumentsManager from '../atoms/renderless/ADocumentsManager.vue'
import GDialogInput from '../molecules/dialogs/GDialogInput.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { ADocumentsManager, GDialogInput },

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
}
</script>

<template>
  <a-documents-manager :docs="docs" :instance="instance">
    <template
      #default="{
        isEditing,
        editMode,
        editModel,
        updateEditMode,
        toggleIsEditing,
      }"
    >
      <div>
        <slot
          name="default"
          v-bind="{
            attrs: {
              items: docs,
              itemKey: docKey,
            },
            docs,
            on: {
              'click:regist': () => updateEditMode({ editMode: 'CREATE' }),
              'click:edit': (event) =>
                updateEditMode({ editMode: 'UPDATE', item: event }),
              'click:delete': (event) =>
                updateEditMode({ editMode: 'DELETE', item: event }),
            },
            updateEditMode,
          }"
        />
        <g-dialog-input
          v-bind="dialogProps"
          :value="isEditing"
          :edit-mode="editMode"
          :instance="editModel"
          @update:editMode="($event) => updateEditMode({ editMode: $event })"
          @input="toggleIsEditing"
        >
          <template #default="editorProps">
            <slot name="editor" v-bind="editorProps" />
          </template>
        </g-dialog-input>
      </div>
    </template>
  </a-documents-manager>
</template>

<style></style>
