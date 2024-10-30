<template>
  <draggable
    tag="div"
    style="gap: 4px"
    class="d-flex flex-column"
    :value="selectableEmployeeIds"
    :group="{ name: 'employeeId', pull: 'clone', put: false }"
  >
    <v-chip v-for="employeeId of selectableEmployeeIds" :key="employeeId" label>
      {{ $store.getters['employees/get'](employeeId).abbr }}
    </v-chip>
  </draggable>
</template>

<script>
import draggable from 'vuedraggable'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { draggable },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    includesExpired: { type: Boolean, default: false },
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    selectableEmployeeIds() {
      return this.$store.getters['employees/items']
        .filter(({ status }) => {
          return this.includesExpired || status === 'active'
        })
        .sort((a, b) => a.fullNameKana.localeCompare(b.fullNameKana))
        .map(({ docId }) => docId)
    },
  },
}
</script>

<style></style>
