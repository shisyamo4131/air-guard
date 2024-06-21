<script>
/**
 * ### GIconFavoriteCustomer
 * お気に入りの切り替えを行うアイコンコンポーネントです。
 *
 * @component
 * @example
 * <GIconFavoriteCustomer :item="item" @toggled="handleToggle" />
 *
 * @props {Object} item - お気に入りの対象となるアイテム
 *
 * @version 1.0.0
 * @date 2024-06-21
 * @autor shisyamo4131
 */
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
    /**
     * お気に入りの状態に応じたアイコンの色を返します。
     */
    color() {
      return this.item?.favorite ? 'yellow darken-2' : ''
    },
    /**
     * ローディング状態かどうかに応じてアイコンを返します。
     */
    icon() {
      return this.loading ? 'mdi-loading mdi-spin' : 'mdi-star'
    },
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * お気に入り状態をトグルします。
     */
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
