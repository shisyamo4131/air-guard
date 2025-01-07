<script>
import GDialogInput from '../molecules/dialogs/GDialogInput.vue'
import ADocumentManager from '../atoms/renderless/ADocumentManager.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GDialogInput, ADocumentManager },
}
</script>

<template>
  <a-document-manager v-bind="$attrs">
    <template #default="{ doc, dialog, triggers }">
      <div>
        <slot name="default" v-bind="{ attrs: doc, on: triggers }" />
        <g-dialog-input v-bind="dialog.attrs" v-on="dialog.on">
          <template #default="editorProps">
            <slot name="editor" v-bind="editorProps" />
          </template>
        </g-dialog-input>
      </div>
    </template>
  </a-document-manager>
</template>

<style></style>
