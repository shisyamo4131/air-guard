<script>
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    item: { type: Object, required: true },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      loading: false,
      model: this.$Customer(),
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    color() {
      return this.item?.favorite ? 'yellow darken-2' : ''
    },
    icon() {
      return this.loading ? 'mdi-loading mdi-spin' : 'mdi-star'
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    async toggle() {
      this.loading = true
      try {
        this.model.initialize({
          ...this.item,
          favorite: !this.item?.favorite || false,
        })
        await this.model.update()
        this.$emit('toggled')
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

<template>
  <v-icon v-bind="$attrs" :color="color" v-on="$listeners" @click="toggle">
    {{ icon }}
  </v-icon>
</template>

<style></style>
