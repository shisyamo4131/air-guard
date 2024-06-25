<script>
import GDialogEditor from './GDialogEditor.vue'
export default {
  extends: GDialogEditor,
  props: {
    label: { type: String, default: '現場', required: false },
    maxWidth: { type: [String, Number], default: 600, required: false },
  },
  data() {
    return {
      model: this.$Site(),
    }
  },
}
</script>

<style></style>
