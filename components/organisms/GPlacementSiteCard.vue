<template>
  <v-card flat width="244" style="background-color: inherit; height: 100%">
    <v-list-item class="px-0">
      <v-list-item-icon class="mr-4">
        <v-icon class="handle" small style="cursor: grab"
          >mdi-arrow-up-down-bold</v-icon
        >
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title class="text-subtitle-2 font-weight-bold">
          {{ site?.name || 'loading' }}
        </v-list-item-title>
        <v-list-item-subtitle class="text-caption">
          <v-icon small>mdi-map-marker</v-icon>
          {{ site?.address || 'loading' }}
        </v-list-item-subtitle>
        <v-list-item-subtitle class="text-caption">
          <v-icon small>mdi-office-building</v-icon>
          {{ customer?.abbr || '未設定' }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-card-actions class="justify-end">
      <v-icon color="primary" small @click="onClickHide">mdi-eye-off</v-icon>
      <v-icon class="ml-2" color="error" small @click="onClickDelete"
        >mdi-delete</v-icon
      >
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
    customer() {
      if (!this.site) return undefined
      const result = this.$store.getters['masters/Customer'](
        this.site.customerId
      )
      return result
    },
    site() {
      return this.$store.getters['masters/Site'](this.siteId)
    },
  },
  methods: {
    onClickDelete() {
      this.$store.dispatch('placements/deleteIndex', { ...this.$props })
    },
    onClickHide() {
      this.$store.dispatch('placements/hideIndex', { ...this.$props })
    },
  },
}
</script>

<style></style>
