<script>
/**
 * ### GEmployeeCard
 *
 * 従業員情報を表示・編集するためのCardコンポーネントです。
 *
 * 機能詳細:
 * - propsはモデルで定義されているものを使用しています。
 *
 * @author shisyamo4131
 * @create 2024-06-28
 * @version 1.1.0
 *
 * 更新履歴:
 * version 1.1.0 - 2024-07-01
 * - 入社日を表示
 */
import GDialogEditorEmployee from '../molecules/dialogs/GDialogEditorEmployee.vue'
import GInputEmployee from '../molecules/inputs/GInputEmployee.vue'
import { props } from '~/models/Employee'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GDialogEditorEmployee, GInputEmployee },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  mixins: [props],
  props: {
    fullName: { type: String, default: '', required: false },
    fullNameKana: { type: String, default: '', required: false },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    onClickEdit() {
      this.$refs[`employee-editor`].open({
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
      >{{ fullName }}
      <v-chip v-if="status === 'expired'" color="red" label x-small outlined>
        {{ `${$CUSTOMER_STATUS[status]}` }}
      </v-chip>
    </v-card-title>
    <v-card-subtitle>
      {{ fullNameKana }}
    </v-card-subtitle>
    <v-card-text>
      <v-chip-group column>
        <v-chip color="blue" label small outlined>
          {{ `${hireDate} 入社` }}
        </v-chip>
      </v-chip-group>
    </v-card-text>
    <g-dialog-editor-employee ref="employee-editor">
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
        <g-input-employee v-bind="attrs" v-on="on" />
      </template>
    </g-dialog-editor-employee>
  </v-card>
</template>

<style></style>
