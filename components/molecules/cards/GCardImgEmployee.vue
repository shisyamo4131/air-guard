<script>
/**
 * ### GCardImgEmployee
 *
 * 概要:
 * 従業員のイメージ写真を表示するコンポーネントです。
 * 新しいイメージ写真をアップロードすることも可能です。
 *
 * @author shisyamo4131
 * @create 2024-07-03
 * @version 1.0.0
 */
import GDialogFileUploader from '~/components/molecules/dialogs/GDialogFileUploader.vue'
import { props } from '~/models/Employee'
export default {
  components: { GDialogFileUploader },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  mixins: [props],
  props: {
    docId: { type: String, required: true },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      noImage: require('@/static/now-printing.png'),
      src: null,
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    isMobile() {
      return this.$vuetify.breakpoint.mobile
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    imgRef: {
      handler(newVal, oldVal) {
        if (!newVal || newVal === oldVal) return
        this.loadPicture()
      },
      immediate: true,
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    async loadPicture() {
      this.src = await this.$getFileUrl(this.imgRef)
    },
    async onUploadComplete(event) {
      const model = this.$Employee()
      try {
        await model.updateImgRef(this.docId, event.url)
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        alert(err.message)
      }
    },
  },
}
</script>

<template>
  <v-card flat>
    <v-chip v-if="leaveDate" class="status-chip" color="warning" label small
      >退職</v-chip
    >
    <v-img
      :key="src || noImage"
      :src="src || noImage"
      contain
      class="align-end"
    >
      <v-sheet v-if="isMobile" class="white--text" color="rgb(0,0,0,.5)">
        <v-card-title class="g-card__title d-block text-truncate">{{
          fullName
        }}</v-card-title>
        <v-card-subtitle>{{ fullNameKana }}</v-card-subtitle>
      </v-sheet>
    </v-img>
    <g-dialog-file-uploader
      directory="/images/employees"
      :file-name="code"
      @upload:complete="onUploadComplete"
    >
      <template #activator="{ attrs, on }">
        <v-btn
          class="btn-camera"
          v-bind="attrs"
          fab
          x-small
          color="primary"
          v-on="on"
        >
          <v-icon>mdi-camera</v-icon>
        </v-btn>
      </template>
    </g-dialog-file-uploader>
  </v-card>
</template>

<style scoped>
.status-chip {
  position: absolute;
  z-index: 3;
  top: 8px;
  left: 8px;
}
.btn-camera {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 3;
}
</style>
