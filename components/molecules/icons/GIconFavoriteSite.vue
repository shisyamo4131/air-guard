<script>
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
