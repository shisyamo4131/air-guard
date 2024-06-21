<script>
/**
 * ### GIconFavoriteSite
 * GIconFavoriteCustomerを継承し、Siteモデル用に拡張したコンポーネントです。
 *
 * @component
 * @example
 * <GIconFavoriteSite :item="item" @toggled="handleToggle" />
 *
 * @extends GIconFavoriteCustomer
 *
 * @version 1.0.0
 * @date 2024-06-21
 * @autor shisyamo4131
 */
import GIconFavoriteCustomer from './GIconFavoriteCustomer.vue'

export default {
  /***************************************************************************
   * EXTENDS
   ***************************************************************************/
  extends: GIconFavoriteCustomer,

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      model: this.$Site(),
    }
  },
}
</script>

<style></style>
