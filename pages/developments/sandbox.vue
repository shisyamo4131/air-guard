<template>
  <v-container>
    <v-card>
      <v-card-title> 取極め未登録現場 </v-card-title>
      <v-card-text>
        <g-autocomplete-site v-model="value" />
        {{ `value: ${value}` }}
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import GAutocompleteSite from '~/components/atoms/inputs/GAutocompleteSite.vue'
export default {
  components: { GAutocompleteSite },
  data() {
    return {
      value: '',
    }
  },
}
</script>

<style></style>
