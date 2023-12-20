<template>
  <g-template-default>
    <template #default="{ height }">
      <v-toolbar flat>
        <a-select
          :items="employees"
          item-text="abbr"
          item-value="docId"
          hide-details
        />
      </v-toolbar>
      <v-container fluid :style="{ height: `${height - toolbarHeight}px` }">
        <v-calendar @click:date="test()" />
      </v-container>
      <v-dialog v-model="dialog.dateClick" max-width="600">
        <g-card-input-form ref="form" @click:cancel="dialog.dateClick = false">
          <template #default>
            <a-select :items="['non-paid', 'paid']" label="種別" />
          </template>
        </g-card-input-form>
      </v-dialog>
    </template>
  </g-template-default>
</template>

<script>
import ASelect from '~/components/atoms/inputs/ASelect.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
export default {
  components: { GTemplateDefault, ASelect },
  data() {
    return {
      dialog: {
        dateClick: false,
      },
    }
  },
  computed: {
    employees() {
      return this.$store.getters['masters/Employees']
    },
    toolbarHeight() {
      if (this.$vuetify.breakpoint.mobile) return 56
      return 64
    },
  },
  methods: {
    test() {
      console.log('OK')
    },
  },
}
</script>

<style></style>
