<script>
import GCardFloatingLabel from '../../atoms/cards/GCardFloatingLabel.vue'
import MedicalCheckup from '~/models/MedicalCheckup'
import GMixinEditModeProvider from '~/mixins/GMixinEditModeProvider'
import GDataTableEmployeeMedicalCheckups from '~/components/atoms/tables/GDataTableEmployeeMedicalCheckups.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GCardFloatingLabel, GDataTableEmployeeMedicalCheckups },

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
      instance: new MedicalCheckup(),
    }
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    /**
     * 従業員IDが変更されたら健康診断ドキュメントの購読を開始します。
     */
    employeeId: {
      handler(v) {
        this.instance.employeeId = v
        this.docs = this.instance.subscribeDocs([
          ['where', 'employeeId', '==', v],
          ['orderBy', 'date', 'desc'],
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
    // 健康診断ドキュメントの購読を解除します。
    this.instance.unsubscribe()
  },
}
</script>

<template>
  <g-card-floating-label
    v-bind="$attrs"
    :color="color"
    label="健康診断"
    icon="mdi-heart-pulse"
  >
    <v-container>
      <g-data-table-employee-medical-checkups :items="docs" />
    </v-container>
  </g-card-floating-label>
</template>

<style></style>
