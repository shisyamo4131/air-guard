<script>
/**
 * 稼働実績登録用UIコンポーネント - 従業員選択 -
 * @author shisyamo4131
 * @refact 2025-01-15
 */
import GDialogEmployeeSelector from '../dialogs/GDialogEmployeeSelector.vue'
import { vueProps } from '~/models/propsDefinition/OperationResult'
import OperationResult from '~/models/OperationResult'
import GSelect from '~/components/atoms/inputs/GSelect.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GDialogEmployeeSelector, GSelect },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: { ...vueProps },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  computed: {
    /**
     * コンポーネント内で使用する `従業員稼働実績` です。
     */
    computedWorkers: {
      get() {
        if (this.workers.length === 0) return []
        return this.workers.map((worker) => {
          const employee = this.$store.getters['employees/get'](
            worker.employeeId
          )
          return employee
        })
      },
      set(v) {
        if (v.length === 0) {
          this.$emit('update:workers', [])
        } else {
          const instance = new OperationResult(this.$props)
          v.forEach((employee) => {
            instance.addWorker({ employeeId: employee.docId })
          })
          this.$emit('update:workers', instance.workers)
        }
      },
    },
  },
}
</script>

<template>
  <v-container fluid>
    <g-dialog-employee-selector
      :items="$store.getters['employees/items']"
      @click:submit="computedWorkers = $event"
    >
      <template #activator="{ attrs, on }">
        <g-select
          v-bind="attrs"
          :value="computedWorkers"
          append-icon=""
          :items="$store.getters['employees/items']"
          multiple
          placeholder="クリックして選択"
          readonly
          v-on="on"
        >
          <template #selection="{ item }">
            <v-chip>{{ item.fullName }}</v-chip>
          </template>
        </g-select>
      </template>
    </g-dialog-employee-selector>
  </v-container>
</template>

<style></style>
