<template>
  <v-container>
    <g-dialog-employee-selector
      :items="items"
      @click:cancel="dialog = false"
      @click:submit="onClickSubmit"
    >
      <template #activator="{ attrs, on }">
        <v-btn v-bind="attrs" v-on="on">open</v-btn>
      </template>
    </g-dialog-employee-selector>
    <v-btn @click="onClickClear">clear</v-btn>
    <p>{{ selectedItems }}</p>
  </v-container>
</template>

<script>
import GDialogEmployeeSelector from '~/components/molecules/dialogs/GDialogEmployeeSelector.vue'

export default {
  components: {
    GDialogEmployeeSelector,
  },
  data() {
    return {
      selectedItems: [],
    }
  },
  computed: {
    items() {
      return this.$store.getters['employees/items'].filter(({ employeeId }) => {
        return !this.selectedItems.some(
          (item) => item.employeeId === employeeId
        )
      })
    },
  },
  methods: {
    onClickSubmit(event) {
      this.selectedItems.push(...event)
    },
    onClickClear() {
      this.selectedItems.splice(0)
    },
  },
}
</script>
