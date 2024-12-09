<template>
  <g-template-fixed label="従業員雇用契約一括更新">
    <v-container>
      <v-toolbar color="secondary" dark dense flat>
        <v-toolbar-title>従業員雇用契約一括更新</v-toolbar-title>
      </v-toolbar>
      <g-select-year />
    </v-container>
  </g-template-fixed>
</template>

<script>
import GSelectYear from '~/components/atoms/inputs/GSelectYear.vue'
import GTemplateFixed from '~/components/templates/GTemplateFixed.vue'
export default {
  components: { GSelectYear, GTemplateFixed },
  data() {
    return {
      year: this.$dayjs().add(1, 'year').format('YYYY'),
    }
  },
}
</script>

<style></style>
