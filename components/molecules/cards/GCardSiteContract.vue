<script>
/**
 * ### GCardSiteContract
 *
 * 現場の取引目情報を表示・編集するためのCardコンポーネントです。
 *
 * #### 機能詳細:
 * - SiteContractモデルをv-bindで引き渡してください。
 * - 編集ボタンがクリックされると`click:edit`イベントをemitします。
 * - 取極の開始日は表示を切り替えることが可能です。（Timelineコンポーネントのopposit対応）
 *
 * #### 注事事項:
 * - ドキュメントボタンが用意されていますが、使用不可です。
 * - PDFをアップロードできるようにする予定です。
 *
 * @updates
 * - version 1.1.0 - 2024-07-13 - `props.docId`が空の場合、登録がないことを表示。
 *                              - `props.docId`が空の場合、編集ボタンを使用不可に。
 *                              - 登録ボタンを追加し、`click:regist`イベントをemitするように。
 * - version 1.0.0 - 2024-07-12 - 初版作成
 *
 * @author shisyamo4131
 * @version 1.1.0
 */
import GSimpleTableSiteContract from '../tables/GSimpleTableSiteContract.vue'
import { vueProps } from '~/models/propsDefinition/SiteContract'
import GBtnEditIcon from '~/components/atoms/btns/GBtnEditIcon.vue'
import GBtnRegistIcon from '~/components/atoms/btns/GBtnRegistIcon.vue'
// import GBtnEditIcon from '~/components/atoms/btns/GBtnEditIcon.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GSimpleTableSiteContract,
    GBtnEditIcon,
    GBtnRegistIcon,
    // GBtnEditIcon,
  },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  mixins: [vueProps],
}
</script>

<template>
  <v-card v-bind="$attrs" v-on="$listeners">
    <v-subheader class="text-subtitle-2 black--text">
      <span v-if="docId">
        {{ $dayjs(startDate).format('YYYY年MM月DD日～') }}
      </span>
      <span v-else> 登録がありません。 </span>
    </v-subheader>
    <g-simple-table-site-contract v-bind="$props" work-shift="day" />
    <v-divider />
    <v-card-actions class="justify-end">
      <g-btn-regist-icon color="primary" @click="$emit('click:regist')" />
      <g-btn-edit-icon
        color="primary"
        :disabled="!docId"
        @click="$emit('click:edit')"
      />
      <v-btn icon disabled><v-icon>mdi-file-document</v-icon></v-btn>
    </v-card-actions>
  </v-card>
</template>

<style></style>
