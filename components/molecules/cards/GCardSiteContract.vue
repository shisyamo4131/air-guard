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
 * @props
 * @prop {string} showDate - trueにすると日付が表示されます。
 *
 * @events
 * @event click:edit - 編集ボタンがクリックされたときにemitされます。
 *
 * @author shisyamo4131
 * @create 2024-06-28
 * @version 1.0.0
 */
import GSimpleTableSiteContract from '../tables/GSimpleTableSiteContract.vue'
import { props } from '~/models/SiteContract'
import GBtnEditIcon from '~/components/atoms/btns/GBtnEditIcon.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GSimpleTableSiteContract,
    GBtnEditIcon,
  },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  mixins: [props],
  props: {
    showDate: { type: Boolean, default: false, required: false },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      items: [
        { value: 'day', text: '日勤' },
        { value: 'night', text: '夜勤' },
      ],
      tab: null,
    }
  },
}
</script>

<template>
  <v-card v-bind="$attrs" v-on="$listeners">
    <v-card-title v-if="showDate" class="g-card__title">
      {{ $dayjs(startDate).format('YYYY年MM月DD日～') }}
    </v-card-title>
    <v-card-text>
      <v-tabs v-model="tab" grow>
        <v-tab v-for="(item, index) of items" :key="index">
          {{ item.text }}
        </v-tab>
      </v-tabs>
      <v-tabs-items v-model="tab">
        <v-tab-item v-for="(item, index) of items" :key="index">
          <v-list-item>
            <v-list-item-icon>
              <v-icon small>mdi-clock-outline</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{
                `${$props[item.value].startAt} ～ ${$props[item.value].endAt}`
              }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <g-simple-table-site-contract
            v-bind="$props"
            :work-shift="item.value"
          />
        </v-tab-item>
      </v-tabs-items>
    </v-card-text>
    <v-card-actions class="justify-end">
      <g-btn-edit-icon color="primary" @click="$emit('click:edit')" />
    </v-card-actions>
  </v-card>
</template>

<style></style>
