<script>
/**
 * 稼働実績登録用UIコンポーネント - 現場選択 -
 * @author shisyamo4131
 * @refact 2025-01-15
 */
import GDialogSiteSelector from '../dialogs/GDialogSiteSelector.vue'
import { vueProps } from '~/models/propsDefinition/OperationResult'
import GSelect from '~/components/atoms/inputs/GSelect.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GDialogSiteSelector, GSelect },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: { ...vueProps },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * 現場が選択された時の処理です。
     * - GDialogSiteSelector の `click:submit` イベントを処理します。
     */
    onSiteSelected(event) {
      if (!Array.isArray(event) || event.length === 0) return
      this.$emit('update:siteId', event[0].docId)
    },
  },
}
</script>

<template>
  <v-container fluid>
    <g-dialog-site-selector single-select @click:submit="onSiteSelected">
      <template #activator="{ attrs, on, items }">
        <g-select
          v-bind="attrs"
          :value="siteId"
          append-icon=""
          :items="items"
          item-text="abbr"
          item-value="docId"
          placeholder="クリックして選択"
          readonly
          required
          v-on="on"
        />
      </template>
    </g-dialog-site-selector>
  </v-container>
</template>

<style></style>
