<script>
import GCardFloatingLabel from '../../atoms/cards/GCardFloatingLabel.vue'
import GDataTableEmployeeContracts from '../tables/GDataTableEmployeeContracts.vue'
import EmployeeContract from '~/models/EmployeeContract'
import GMixinEditModeProvider from '~/mixins/GMixinEditModeProvider'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GCardFloatingLabel,
    GDataTableEmployeeContracts,
  },

  /***************************************************************************
   * MIXINS
   ***************************************************************************/
  mixins: [GMixinEditModeProvider],

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * コンポーネントのカラーです。
     */
    color: { type: String, default: undefined, required: false },

    /**
     * 管理対象の従業員IDです。
     */
    employeeId: { type: String, required: true },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      docs: [],
      instance: new EmployeeContract(),
    }
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    /**
     * 従業員IDが変更されたら雇用契約ドキュメントの購読を開始します。
     */
    employeeId: {
      handler(v) {
        this.instance.employeeId = v
        this.docs = this.instance.subscribeDocs([
          ['where', 'employeeId', '==', v],
          ['orderBy', 'startDate', 'desc'],
          ['limit', 3],
        ])
      },
      immediate: true,
    },
  },

  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    // 雇用保険ドキュメントの購読を解除します。
    this.instance.unsubscribe()
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    printLaborTerms(item) {
      this.$GENERATE_LABOR_TERMS(item.docId, { download: false })
    },
  },
}
</script>

<template>
  <g-card-floating-label
    v-bind="$attrs"
    :color="color"
    label="雇用契約（直近3件）"
    icon="mdi-file-sign"
  >
    <g-data-table-employee-contracts :items="docs" :button-color="color">
      <template #print="{ item }">
        <v-btn :color="color" icon @click="printLaborTerms(item)"
          ><v-icon>mdi-printer</v-icon></v-btn
        >
      </template>
    </g-data-table-employee-contracts>
  </g-card-floating-label>
</template>

<style></style>
