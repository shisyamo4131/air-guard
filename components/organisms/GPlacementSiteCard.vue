<template>
  <v-card flat width="244" style="background-color: inherit; height: 100%">
    <v-list-item>
      <v-list-item-icon>
        <v-icon class="handle" style="cursor: grab"
          >mdi-arrow-up-down-bold</v-icon
        >
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title>
          {{ site.abbr }}
        </v-list-item-title>
        <v-list-item-subtitle>
          {{ site.address }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-card-actions class="justify-end">
      <v-icon color="error" small @click="onClickDelete">mdi-delete</v-icon>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  props: {
    siteId: { type: String, required: true },
    workShift: { type: String, required: true },
  },
  computed: {
    site() {
      return this.$store.getters['masters/Site'](this.siteId)
    },
  },
  methods: {
    onClickDelete() {
      this.$store.dispatch('placements/deleteIndex', { ...this.$props })
    },
  },
}
</script>

<style></style>
