<script>
/**
 * ## GCardImgEmployee
 *
 * 従業員のイメージ写真を表示するコンポーネントです。
 *
 * - `props.instance`で`Employee`インスタンスを受け取ります。
 * - インスタンスの`imgRef`を参照し、該当するイメージをstorageからDL、表示します。
 * - 新しいイメージに差し替えるためのUIを提供します。
 *
 * @author shisyamo4131
 * @version 1.0.0
 * @updates
 * - version 1.0.0 - 2024-09-12 - 初版作成
 */
import { getFileDownloadURL } from 'air-firebase'
import GDialogFileUploader from '~/components/molecules/dialogs/GDialogFileUploader.vue'
import Employee from '~/models/Employee'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GDialogFileUploader },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    instance: {
      type: Object,
      required: true,
      validator(instance) {
        return instance instanceof Employee
      },
    },
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
    'instance.imgRef': {
      handler(v) {
        if (!v) return
        this.loadPicture(v)
      },
      immediate: true,
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    async loadPicture(url) {
      this.src = await getFileDownloadURL(url)
    },
    async onUploadComplete(event) {
      try {
        await Employee.updateImgRef(this.instance.docId, event.url)
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
    <v-chip
      v-if="instance.leaveDate"
      class="status-chip"
      color="warning"
      label
      small
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
          instance.fullName
        }}</v-card-title>
        <v-card-subtitle>{{ instance.fullNameKana }}</v-card-subtitle>
      </v-sheet>
    </v-img>
    <g-dialog-file-uploader
      :directory="`/images/employees/${instance.docId}`"
      file-name="id"
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
