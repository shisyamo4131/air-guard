<script>
/**
 * ### GSiteContractsTimeline
 *
 * 現場の取極め情報を表示・編集するためのTimelineコンポーネントです。
 *
 * #### 機能の詳細:
 * - 指定された現場IDの取極ドキュメント（SiteContracts）を取得し、Timelineコンポーネントを使って表示します。
 *
 * #### 注意事項:
 * ‐ version 1.1.0 現在、過去の取極めを確認する手段を用意していません。
 *
 * @updates
 * - version 1.1.0 - 2024-07-13 - 取極めは最新の1件のみを表示するように変更。
 *                              - 登録ボタンを削除し、登録のトリガーはGCardSiteContractから受け取るように修正。
 *                              - onClickRegistを実装。
 * - version 1.0.0 - 2024-07-12 - 初版作成
 *
 * @author shisyamo4131
 * @version 1.1.0
 */
import GCardSiteContract from '../molecules/cards/GCardSiteContract.vue'
import GDialogEditor from '../molecules/dialogs/GDialogEditor.vue'
import GInputSiteContract from '../molecules/inputs/GInputSiteContract.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GDialogEditor,
    GInputSiteContract,
    GCardSiteContract,
  },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    siteId: { type: String, required: true },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      allowedDates: (val) => !this.items.some((item) => item.startDate === val),
      items: [],
      model: this.$SiteContract(),
      workShift: 'day',
      tab: null,
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    dayContracts() {
      return this.items
        .filter(({ workShift }) => workShift === 'day')
        .sort((a, b) => {
          if (a.docId < b.docId) return 1
          if (a.docId > b.docId) return -1
          return 0
        })
    },
    nightContracts() {
      return this.items
        .filter(({ workShift }) => workShift === 'night')
        .sort((a, b) => {
          if (a.docId < b.docId) return 1
          if (a.docId > b.docId) return -1
          return 0
        })
    },
    sortedItems() {
      const result = this.items
        .filter(({ workShift }) => workShift === this.workShift)
        .sort((a, b) => {
          if (a.docId < b.docId) return 1
          if (a.docId > b.docId) return -1
          return 0
        })
      return result
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    siteId: {
      handler(newVal, oldVal) {
        if (newVal === oldVal) return
        this.model.siteId = newVal
        this.subscribe()
      },
      immediate: true,
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    onClickRegist(workShift) {
      this.$refs.editor.open({ item: { workShift }, editMode: 'REGIST' })
    },
    onClickEdit(item) {
      this.$refs.editor.open({ item, editMode: 'UPDATE' })
    },
    subscribe() {
      this.items = this.model.subscribe()
    },
  },
}
</script>

<template>
  <v-card v-bind="$attrs" min-height="360" v-on="$listeners">
    <v-card-title class="g-card__title"> 取極め </v-card-title>
    <v-tabs v-model="workShift">
      <v-tab class="ml-auto" tab-value="day">日勤</v-tab>
      <v-tab tab-value="night">夜勤</v-tab>
    </v-tabs>
    <v-card-text>
      <v-tabs-items v-model="workShift">
        <v-tab-item value="day">
          <g-card-site-contract
            outlined
            v-bind="dayContracts[0]"
            @click:regist="onClickRegist('day')"
            @click:edit="onClickEdit(dayContracts[0])"
          />
        </v-tab-item>
        <v-tab-item value="night">
          <g-card-site-contract
            outlined
            v-bind="nightContracts[0]"
            @click:regist="onClickRegist('night')"
            @click:edit="onClickEdit(nightContracts[0])"
          />
        </v-tab-item>
      </v-tabs-items>
      <!-- <v-timeline v-else :dense="$vuetify.breakpoint.smAndDown">
        <v-timeline-item
          v-for="(item, index) of sortedItems"
          :key="index"
          :color="index === 0 ? 'primary' : 'grey'"
          small
        >
          <template v-if="$vuetify.breakpoint.mdAndUp" #opposite>
            <span
              :class="`text-subtitle-1 font-weight-bold ${
                index === 0 ? 'primary' : 'grey'
              }--text`"
            >
              {{ item.startDate }}
            </span>
          </template>
          <g-card-site-contract
            outlined
            :show-date="$vuetify.breakpoint.smAndDown"
            v-bind="item"
            @click:edit="onClickEdit(item)"
          />
        </v-timeline-item>
      </v-timeline> -->
    </v-card-text>
    <g-dialog-editor
      ref="editor"
      :default-item="{ siteId }"
      label="取極め"
      max-width="540"
      model-id="SiteContract"
    >
      <template #default="{ attrs, on }">
        <g-input-site-contract
          v-bind="attrs"
          :allowed-dates="allowedDates"
          v-on="on"
        />
      </template>
    </g-dialog-editor>
  </v-card>
</template>

<style></style>
