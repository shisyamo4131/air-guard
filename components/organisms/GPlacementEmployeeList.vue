<template>
  <draggable
    tag="v-list"
    :group="{ name: 'employees', pull: 'clone', put: false }"
    :sort="false"
    :value="employees.map(({ docId }) => docId)"
    @start="$emit('selected', employees[$event.oldIndex].docId)"
    @end="$emit('selected', null)"
  >
    <v-list-item v-for="(item, index) of employees" :key="index">
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
      return this.$store.getters['masters/Employees']
    },
  },
}
</script>

<style></style>
