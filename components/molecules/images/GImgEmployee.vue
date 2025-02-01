<script>
/**
 * 従業員のイメージ写真を表示するコンポーネントです。
 * - 新しいイメージに差し替えるためのUIを提供します。
 * @author shisyamo4131
 * @refact 2025-02-01
 */
import { getFileDownloadURL } from 'air-firebase'
import GDialogFileUploader from '~/components/molecules/dialogs/GDialogFileUploader.vue'
import Employee, { vueProps } from '~/models/Employee'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GDialogFileUploader },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: vueProps,

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      /**
       * 写真が存在しなかった場合の代替です。
       */
      noImage: require('@/static/now-printing.png'),

      /**
       * 写真のソースです。
       */
      src: null,
    }
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    /**
     * props.imgRef を監視します。
     * - 更新されたら loadPicture を実行します。
     */
    imgRef: {
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
    /**
     * 引数で受け取ったパスをもとに写真をダウンロードします。
     */
    async loadPicture(url) {
      this.src = await getFileDownloadURL(url)
    },

    /**
     * 写真のアップロードが完了した時の処理です。
     * - 従業員の imgRef プロパティを更新します。
     */
    async onUploadComplete(event) {
      try {
        await Employee.updateImgRef(this.docId, event.url)
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
      <v-sheet class="white--text" color="rgb(0,0,0,.5)">
        <v-card-title class="g-card__title d-block text-truncate">{{
          fullName
        }}</v-card-title>
        <v-card-subtitle>{{ fullNameKana }}</v-card-subtitle>
      </v-sheet>
    </v-img>
    <g-dialog-file-uploader
      :directory="`/images/employees/${docId}`"
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
