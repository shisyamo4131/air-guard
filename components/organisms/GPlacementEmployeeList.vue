<template>
  <draggable
    tag="v-list"
    :group="{ name: 'employees', pull: 'clone', put: false }"
    :sort="false"
    :value="employees.map(({ docId }) => docId)"
    @start="$emit('selected', employees[$event.oldIndex].docId)"
    @end="$emit('selected', null)"
  >
    <v-list-item v-for="(item, index) of employees" :key="index" dense>
      <v-list-item-content>
        <v-list-item-title>
          <v-icon class="handle" left small style="cursor: grab"
            >mdi-menu</v-icon
          >
          {{ item.abbr }}
        </v-list-item-title>
      </v-list-item-content>
    </v-list-item>
  </draggable>
</template>

<script>
import draggable from 'vuedraggable'
export default {
  components: { draggable },
  computed: {
    employees() {
      const result = this.$store.getters['masters/Employees']
      result.sort((a, b) => {
        if (a.code < b.code) return -1
        if (a.code > b.code) return 1
        return 0
      })
      return result
    },
  },
}
</script>

<style></style>
