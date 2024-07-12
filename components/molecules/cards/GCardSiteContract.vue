<script>
/**
 * ### GCardSiteContract
 *
 * 現場の取引目情報を表示・編集するためのCardコンポーネントです。
 *
 * 機能詳細:
 * - SiteContractモデルをv-bindで引き渡してください。
 * - 編集ボタンがクリックされると`click:edit`イベントをemitします。
 * - 取極の開始日は表示を切り替えることが可能です。（Timelineコンポーネントのopposit対応）
 *
 * @updates
 * - version 1.0.0 - 2024-07-12 - 初版作成
 *
 * @author shisyamo4131
 * @version 1.0.0
 */
import GSimpleTableSiteContract from '../tables/GSimpleTableSiteContract.vue'
import { props } from '~/models/SiteContract'
import GBtnEditIcon from '~/components/atoms/btns/GBtnEditIcon.vue'
// import GBtnEditIcon from '~/components/atoms/btns/GBtnEditIcon.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GSimpleTableSiteContract,
    GBtnEditIcon,
    // GBtnEditIcon,
  },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  mixins: [props],
  props: {
    showDate: { type: Boolean, default: false, required: false },
  },
}
</script>

<template>
  <v-card v-bind="$attrs" v-on="$listeners">
    <v-subheader v-if="showDate" class="text-subtitle-2 black--text">
      {{ $dayjs(startDate).format('YYYY年MM月DD日～') }}
    </v-subheader>
    <g-simple-table-site-contract v-bind="$props" work-shift="day" />
    <v-divider />
    <v-card-actions class="justify-end">
      <g-btn-edit-icon color="primary" @click="$emit('click:edit')" />
      <v-btn icon disabled><v-icon>mdi-file-document</v-icon></v-btn>
    </v-card-actions>
  </v-card>
</template>

<style></style>
