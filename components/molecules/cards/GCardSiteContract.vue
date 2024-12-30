<script>
/**
 * ### GCardSiteContract
 *
 * 単一の現場取極め情報を表示するためのCardコンポーネントです。
 *
 * - 情報の詳細表示には`GSimpleTableSiteContract`を使用しています。
 * - `props.instance`で`SiteContract`インスタンスを受け取ります。
 * - 編集ボタンがクリックされると、click:editイベントをemitします。
 *
 * #### 注事事項:
 * - ドキュメントボタンが用意されていますが、使用不可です。
 * - PDFをアップロードできるようにする予定です。
 *
 * @author shisyamo4131
 * @version 1.0.0
 * @updates
 * - version 1.0.0 - 2024-09-08 - 初版作成
 */
import GSimpleTableSiteContract from '../tables/GSimpleTableSiteContract.vue'
import GBtnEdit from '~/components/atoms/btns/GBtnEdit.vue'
import SiteContract from '~/models/SiteContract'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GSimpleTableSiteContract,
    GBtnEdit,
  },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    instance: {
      type: Object,
      required: true,
      validator: (instance) => instance instanceof SiteContract,
    },
  },
}
</script>

<template>
  <v-card v-bind="$attrs" v-on="$listeners">
    <div
      class="d-flex pa-4 text-subtitle-2 black--text flex-wrap"
      style="gap: 12px"
    >
      <div>
        {{ `開始日: ${$dayjs(instance.startDate).format('YYYY年MM月DD日～')}` }}
      </div>
      <div>{{ `開始時刻: ${instance.startTime}` }}</div>
      <div>{{ `終了時刻: ${instance.endTime}` }}</div>
    </div>
    <g-simple-table-site-contract :instance="instance" />
    <v-card-text v-if="instance.remarks">
      {{ instance.remarks }}
    </v-card-text>
    <v-divider />
    <v-card-actions class="justify-end">
      <g-btn-edit
        icon
        color="primary"
        @click="$emit('click:edit', instance.clone())"
      />
      <v-btn icon disabled><v-icon>mdi-file-document</v-icon></v-btn>
    </v-card-actions>
  </v-card>
</template>

<style></style>
