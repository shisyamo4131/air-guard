<script>
import GInputEmployeeAllowance from '../inputs/GInputEmployeeAllowance.vue'
import GDataTableEmployeeAllowances from '../tables/GDataTableEmployeeAllowances.vue'
import GBtnRegist from '~/components/atoms/btns/GBtnRegist.vue'
import EmployeeAllowance from '~/models/EmployeeAllowance'
import AArrayManager from '~/components/atoms/renderless/AArrayManager.vue'
export default {
  /****************************************************************************
   * COMPONENTS
   ****************************************************************************/
  components: {
    GBtnRegist,
    GInputEmployeeAllowance,
    AArrayManager,
    GDataTableEmployeeAllowances,
  },

  /****************************************************************************
   * PROPS
   ****************************************************************************/
  props: {
    /**
     * 手当インスタンスの配列を受け取ります。
     */
    value: {
      type: Array,
      default: () => [],
      validator: (arr) => {
        if (!Array.isArray(arr)) return false
        if (!arr.length) return true
        return arr.every((instance) => instance instanceof EmployeeAllowance)
      },
      required: false,
    },
  },

  /****************************************************************************
   * DATA
   ****************************************************************************/
  data() {
    return {}
  },
}
</script>

<template>
  <a-array-manager
    v-slot="{ input, dialog, table }"
    :value="value"
    @input="$emit('input', $event)"
  >
    <v-card v-bind="$attrs" v-on="$listeners">
      <v-toolbar dense flat>
        <v-toolbar-title class="text-subtitle-1">支給手当</v-toolbar-title>
        <v-spacer />
        <v-dialog v-bind="dialog.attrs" max-width="360" v-on="dialog.on">
          <template #activator="{ attrs, on }">
            <g-btn-regist icon v-bind="attrs" color="primary" v-on="on" />
          </template>
          <template #default>
            <g-input-employee-allowance v-bind="input.attrs" v-on="input.on" />
          </template>
        </v-dialog>
      </v-toolbar>
      <v-card-text class="pt-0">
        <g-data-table-employee-allowances
          v-bind="table.attrs"
          v-on="table.on"
        />
      </v-card-text>
    </v-card>
  </a-array-manager>
</template>

<style></style>
