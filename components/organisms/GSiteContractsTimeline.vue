<script>
/**
 * ### GSiteContractsTimeline
 *
 * 現場の取極め情報を表示・編集するためのTimelineコンポーネントです。
 *
 * 機能の詳細:
 * - 指定された現場IDの取極ドキュメント（SiteContracts）を取得し、Timelineコンポーネントを使って表示します。
 * - (未実装)モバイルの場合、Timelineではなく、最新の取極を1件のみ表示？paginationで切替？
 *
 * @updates
 * - version 1.0.0 - 2024-07-12 - 初版作成
 *
 * @author shisyamo4131
 * @version 1.1.0
 */
import GBtnRegistIcon from '../atoms/btns/GBtnRegistIcon.vue'
import GCardSiteContract from '../molecules/cards/GCardSiteContract.vue'
import GDialogEditor from '../molecules/dialogs/GDialogEditor.vue'
import GInputSiteContract from '../molecules/inputs/GInputSiteContract.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GDialogEditor,
    GBtnRegistIcon,
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
    <v-card-title class="g-card__title">
      取極め
      <g-dialog-editor
        ref="editor"
        :default-item="{ siteId }"
        label="取極め"
        max-width="540"
        model-id="SiteContract"
      >
        <template #activator="{ attrs, on }">
          <g-btn-regist-icon
            class="ml-auto"
            color="primary"
            v-bind="attrs"
            v-on="on"
          />
        </template>
        <template #default="{ attrs, on }">
          <g-input-site-contract
            v-bind="attrs"
            :allowed-dates="allowedDates"
            v-on="on"
          />
        </template>
      </g-dialog-editor>
    </v-card-title>
    <v-tabs v-model="workShift">
      <v-tab class="ml-auto" tab-value="day">日勤</v-tab>
      <v-tab tab-value="night">夜勤</v-tab>
    </v-tabs>
    <v-card-text>
      <g-card-site-contract
        v-if="$vuetify.breakpoint.mobile"
        outlined
        show-date
        v-bind="sortedItems[0]"
        @click:edit="onClickEdit(sortedItems[0])"
      />
      <v-timeline v-else :dense="$vuetify.breakpoint.smAndDown">
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
      </v-timeline>
    </v-card-text>
  </v-card>
</template>

<style></style>
