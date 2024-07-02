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
 * @props
 * @prop {string} siteId - 現場IDです。
 *
 * @author shisyamo4131
 * @create 2024-06-29
 * @version 1.1.0
 *
 * 更新履歴:
 * version 1.1.0 - 2024-07-02
 *  - GDialogEditorの仕様変更に伴う改修。
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
      test: {
        siteId: '8wWP144vKwQBJXGw7b6o',
      },
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    sortedItems() {
      const result = this.items
        .map((item) => item)
        .sort((a, b) => {
          if (a.startDate < b.startDate) return 1
          if (a.startDate > b.startDate) return -1
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
  <v-card v-bind="$attrs" v-on="$listeners">
    <v-card-title class="g-card__title">
      取極
      <g-dialog-editor
        ref="editor"
        :default-item="{ siteId }"
        label="取極"
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
    <v-card-text>
      <v-timeline :dense="$vuetify.breakpoint.mobile">
        <v-timeline-item
          v-for="(item, index) of sortedItems"
          :key="index"
          small
        >
          <template #opposite>
            <span
              :class="`text-h6 font-weight-bold primary--text`"
              v-text="item.startDate"
            ></span>
          </template>
          <g-card-site-contract
            outlined
            v-bind="item"
            @click:edit="onClickEdit(item)"
          />
        </v-timeline-item>
      </v-timeline>
    </v-card-text>
  </v-card>
</template>

<style></style>
