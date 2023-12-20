<template>
  <g-template-default>
    <template #default>
      <v-container fluid>
        <v-form ref="form">
          <g-input-application v-bind.sync="editItem" edit-mode="UPDATE" />
        </v-form>
        <v-btn @click="test">test</v-btn>
      </v-container>
    </template>
  </g-template-default>
</template>

<script>
import GInputApplication from '~/components/molecules/inputs/GInputApplication.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
export default {
  components: { GTemplateDefault, GInputApplication },
  data() {
    return {
      editItem: this.$LeaveApplication(),
    }
  },
  methods: {
    test() {
      this.$refs.form.reset()
      this.$refs.form.validate()
    },
  },
}
</script>

<style></style>
