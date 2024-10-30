<script>
/**
 * ## GArrangementTable
 *
 * 配置管理用の v-simple-table コンポーネントです。
 *
 * - props.currentDate, props.length を指定すると、指定された期間の日付列を生成します。
 * - props.siteWorkShiftIds で指定された分の行を生成します。
 *   -> siteWorkShiftIds 配列の要素は ${siteId}-${workShift} でなければなりません。
 *   -> .sync 修飾子で同期することができます。
 * - slots.col を使って各セルにコンポーネントを配置することができます。
 *
 * @author shisyamo4131
 */
import dayjs from 'dayjs'
import ja from 'dayjs/locale/ja'
import GArrangementSiteWorkShiftRow from './GArrangementSiteWorkShiftRow.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GArrangementSiteWorkShiftRow },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * Arrangements/assignments/employees を受け取ります。
     * - 従業員の同一日、同一勤務区分配置や連勤状態の確認に使用されます。
     */
    assignments: { type: Object, default: () => ({}), required: false },
    currentDate: { type: String, default: undefined, required: false },
    /**
     * 省略表示にします。
     */
    ellipsis: { type: Boolean, default: false, required: false },
    length: { type: Number, default: 7, required: false },
    /**
     * 現場の取極め情報の配列です。
     * - 現場や勤務区分を限定する必要はありません。コンポーネント内で抽出されます。
     * - 該当する取極め情報が存在すると、従業員を配置した際に上番・下番時間などが設定されます。
     */
    siteContracts: { type: Array, default: () => [], required: false },
    /**
     * ${siteId}-${workShift} の配列です。
     * - .sync 修飾子を使用することができます。
     */
    siteWorkShiftIds: { type: Array, default: () => [], required: false },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dialog: {
        siteDetail: false,
      },
      item: {
        siteDetail: null,
      },
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    columns() {
      if (!this.currentDate) return []
      const dates = [...Array(this.length)].map((_, i) =>
        dayjs(this.currentDate).add(i, 'day').format('YYYY-MM-DD')
      )
      return dates.map((date, index) => {
        return {
          date,
          index,
          col: dayjs(date).locale(ja).format('MM/DD(ddd)'),
        }
      })
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    'dialog.siteDetail'(v) {
      if (v) return
      this.item.siteDetail = null
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * 現場の削除アイコンがクリックされた時の処理です。
     * - siteWorkShiftIds から該当する siteWorkShiftId を除外して update:siteWorkShiftIds イベントを emit します。
     */
    onClickExcludeSite(siteWorkShiftId) {
      const index = this.siteWorkShiftIds.indexOf(siteWorkShiftId)
      if (index !== -1) {
        const updatedSiteIndex = [...this.siteWorkShiftIds]
        updatedSiteIndex.splice(index, 1)
        this.$emit('update:siteWorkShiftIds', updatedSiteIndex)
      }
    },
    onClickShowSiteDetail(item) {
      this.item.siteDetail = structuredClone(item)
      this.dialog.siteDetail = true
    },
  },
}
</script>

<template>
  <v-simple-table id="arrangement-table" fixed-header>
    <thead>
      <tr>
        <th v-for="column of columns" :key="column.date">
          {{ column.col }}
        </th>
      </tr>
    </thead>
    <tbody>
      <template v-for="(siteWorkShiftId, index) of siteWorkShiftIds">
        <tr :key="`site-row-${index}`">
          <td colspan="7">
            <g-arrangement-site-work-shift-row
              :value="siteWorkShiftId"
              @click:show-detail="onClickShowSiteDetail"
              @click:exclude="onClickExcludeSite"
            />
          </td>
        </tr>
        <tr :key="`arrangement-row-${index}`">
          <td v-for="column of columns" :key="column.date">
            <slot
              name="default"
              v-bind="{
                attrs: {
                  assignments: assignments?.[column.date] || {},
                  date: column.date,
                  ellipsis,
                  siteId: siteWorkShiftId.split('-')[0],
                  siteContracts,
                  workShift: siteWorkShiftId.split('-')[1],
                },
              }"
            />
          </td>
        </tr>
      </template>
    </tbody>
    <v-dialog v-model="dialog.siteDetail" max-width="480">
      <v-card>
        <v-toolbar color="primary" dark dense flat>
          <v-toolbar-title class="text-body-1"> 現場情報詳細 </v-toolbar-title>
          <v-spacer />
          <v-icon @click="dialog.siteDetail = false">mdi-close</v-icon>
        </v-toolbar>
        <v-list class="px-0 py-2" :dense="$vuetify.breakpoint.mobile">
          <v-list-item>
            <v-list-item-icon class="mr-2">
              <v-icon small>mdi-dump-truck</v-icon>
            </v-list-item-icon>
            <v-list-item-title style="white-space: normal; overflow: visible">
              {{ item.siteDetail?.site?.name || 'undefined' }}
            </v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-icon class="mr-2">
              <v-icon small>mdi-map-marker</v-icon>
            </v-list-item-icon>
            <v-list-item-title style="white-space: normal; overflow: visible">
              {{ item.siteDetail?.site?.address || 'undefined' }}
            </v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-icon class="mr-2">
              <v-icon left small>mdi-card-account-details</v-icon>
            </v-list-item-icon>
            <v-list-item-title> 実装されていません。 </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card>
    </v-dialog>
  </v-simple-table>
</template>

<style></style>
