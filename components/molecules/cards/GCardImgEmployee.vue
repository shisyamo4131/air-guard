<script>
/**
 * ### GCardImgEmployee
 *
 * 従業員のイメージ写真を表示するコンポーネントです。
 *
 * @author shisyamo4131
 * @create 2024-07-02
 * @version 1.0.0
 */
import { props } from '~/models/Employee'
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  mixins: [props],
  props: {
    fullName: { type: String, default: '', required: false },
    fullNameKana: { type: String, default: '', required: false },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      img: require('@/static/now-printing.png'),
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
}
</script>

<template>
  <v-card flat>
    <v-chip v-if="leaveDate" class="status-chip" color="warning" label small
      >退職</v-chip
    >
    <v-img :src="img" contain class="align-end">
      <v-sheet v-if="isMobile" class="white--text" color="rgb(0,0,0,.5)">
        <v-card-title class="g-card__title d-block text-truncate">{{
          fullName
        }}</v-card-title>
        <v-card-subtitle>{{ fullNameKana }}</v-card-subtitle>
      </v-sheet>
    </v-img>
    <v-btn class="btn-camera" disabled fab x-small color="primary">
      <v-icon>mdi-camera</v-icon>
    </v-btn>
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
