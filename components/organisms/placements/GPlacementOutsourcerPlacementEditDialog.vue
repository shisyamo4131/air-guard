<script>
import GPlacementEmployeePlacementEditDialog from './GPlacementEmployeePlacementEditDialog'
import GBtnSubmit from '~/components/atoms/btns/GBtnSubmit.vue'
import { PlacedOutsourcer } from '~/models/Placement'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
export default {
  components: { GBtnSubmit, GTextField },

  extends: GPlacementEmployeePlacementEditDialog,

  data() {
    return {
      editModel: new PlacedOutsourcer(),
      label: '外注先配置情報変更',
    }
  },

  computed: {
    worker() {
      const [outsourcerId] = this.item.outsourcerKey.split('-')
      const result = this.$store.getters['outsourcers/get'](outsourcerId)
      return result?.name || 'N/A'
    },
  },

  watch: {
    item: {
      handler(v) {
        this.editModel = new PlacedOutsourcer(structuredClone(v))
      },
      immediate: true,
    },
  },
}
</script>

<style></style>
