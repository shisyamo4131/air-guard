<script>
/**
 * ADocumentManager を拡張したドキュメント管理用共有コンポーネントです。
 * ドキュメント編集用のダイアログを内包しています。
 * @author shisyamo4131
 */
import { FireModel } from 'air-firebase'
import GDialogInput from '../molecules/dialogs/GDialogInput.vue'
import ADocumentManager from '../atoms/renderless/ADocumentManager.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GDialogInput, ADocumentManager },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * 管理対象のドキュメントIDです。
     */
    docId: { type: String, required: true },

    /**
     * ダイアログコンポーネントに引き渡されるプロパティです。
     */
    dialogProps: { type: Object, default: () => {}, required: false },

    /**
     * 管理対象のインスタンスです。
     * - FireModel を継承したクラスインスタンスである必要があります。
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
  <a-document-manager :doc-id="docId" :instance="instance">
    <template
      #default="{ doc, editMode, isEditing, updateEditMode, toggleIsEditing }"
    >
      <div>
        <slot
          name="default"
          v-bind="{
            attrs: doc,
            on: {
              'click:edit': () => updateEditMode('UPDATE'),
              'click:delete': () => updateEditMode('DELETE'),
            },
          }"
        />
        <g-dialog-input
          v-bind="dialogProps"
          :value="isEditing"
          :edit-mode="editMode"
          :instance="doc"
          @update:editMode="updateEditMode"
          @input="toggleIsEditing"
        >
          <template #default="editorProps">
            <slot name="editor" v-bind="editorProps" />
          </template>
        </g-dialog-input>
      </div>
    </template>
  </a-document-manager>
</template>

<style></style>
