<template>
  <v-container>
    <v-card>
      <v-card-text>
        <g-autocomplete-site :items="$store.getters['masters/Sites']" />
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import GAutocompleteSite from '~/components/molecules/inputs/GAutocompleteSite.vue'
export default {
  components: { GAutocompleteSite },
}
</script>

<style></style>
