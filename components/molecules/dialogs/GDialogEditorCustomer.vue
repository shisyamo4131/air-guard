<script>
import GDialogEditor from './GDialogEditor.vue'
export default {
  extends: GDialogEditor,
  props: {
    label: { type: String, default: '取引先', required: false },
    maxWidth: { type: [String, Number], default: 600, required: false },
  },
  data() {
    return {
      model: this.$Customer(),
    }
  },
}
</script>

<style></style>
