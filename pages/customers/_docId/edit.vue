<template>
  <g-template-default :label="editModel.name1">
    <template #prepend-toolbar>
      <v-btn icon @click="$router.go(-1)"
        ><v-icon>mdi-chevron-left</v-icon></v-btn
      >
    </template>
    <template #append-toolbar>
      <v-spacer />
      <v-toolbar-items>
        <v-btn
          :disabled="loading"
          :loading="loading"
          text
          @click="onClickSubmit"
          ><v-icon left>mdi-check</v-icon>確定</v-btn
        >
      </v-toolbar-items>
    </template>
    <v-container>
      <v-form ref="form" :disabled="loading">
        <g-input-customer v-bind.sync="editModel" />
      </v-form>
    </v-container>
  </g-template-default>
</template>

<script>
import GInputCustomer from '~/components/molecules/inputs/GInputCustomer.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
export default {
  components: { GTemplateDefault, GInputCustomer },
  async asyncData({ app, route }) {
    const docId = route.params.docId
    const editModel = app.$Customer()
    await editModel.fetch(docId)
    return { docId, editModel }
  },
  data() {
    return {
      loading: false,
    }
  },
  methods: {
    validate() {
      const result = this.$refs.form.validate()
      if (!result) {
        alert('入力に不備があります。')
      }
      return result
    },
    async onClickSubmit() {
      if (!this.validate()) return
      try {
        this.loading = true
        await this.editModel.update()
        this.$router.push(`/customers/${this.docId}`)
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        alert(err.message)
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style></style>
