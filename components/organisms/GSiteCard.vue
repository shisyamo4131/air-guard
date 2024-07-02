<script>
/**
 * ### GSiteCard
 *
 * 現場情報を表示・編集するためのCardコンポーネントです。
 *
 * 機能詳細:
 * - propsはモデルで定義されているものを使用しています。
 *
 * @author shisyamo4131
 * @create 2024-06-27
 * @version 1.1.0
 *
 * 更新履歴:
 * version 1.1.0 - 2024-07-02
 *  - GDialogEditorの仕様変更に伴う改修。
 */
import GDialogEditor from '../molecules/dialogs/GDialogEditor.vue'
import GInputSite from '../molecules/inputs/GInputSite.vue'
import { props } from '~/models/Site'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GDialogEditor, GInputSite },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  mixins: [props],
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    onClickEdit() {
      this.$refs[`site-editor`].open({
        item: this.$props,
        editMode: 'UPDATE',
      })
    },
  },
}
</script>

<template>
  <v-card v-bind="$attrs" v-on="$listeners">
    <v-card-title class="g-card__title text-truncate d-block"
      >{{ name }}
      <v-chip v-if="status === 'expired'" color="red" label x-small outlined>
        {{ `${$CUSTOMER_STATUS[status]}` }}
      </v-chip>
    </v-card-title>
    <v-card-subtitle>
      {{ abbr }}
    </v-card-subtitle>
    <g-dialog-editor ref="site-editor" model-id="Site" label="現場">
      <template #activator="{ attrs }">
        <v-btn
          v-bind="attrs"
          fab
          color="primary"
          top
          right
          absolute
          small
          @click="onClickEdit"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
      </template>
      <template #default="{ attrs, on }">
        <g-input-site v-bind="attrs" v-on="on" />
      </template>
    </g-dialog-editor>
    <v-card-text>
      <v-chip-group column>
        <v-chip color="primary" label outlined
          ><v-icon left>mdi-domain</v-icon>{{ customer?.abbr || '' }}</v-chip
        >
      </v-chip-group>
    </v-card-text>
  </v-card>
</template>

<style></style>
