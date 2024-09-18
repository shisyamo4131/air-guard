<script>
/**
 * ## GSiteContractsManager
 *
 * 現場の取極め情報を管理するコンポーネントです。
 *
 * - 取極め情報の表示は、勤務区分ごとに最新の1件のみです。-> 遷移を確認したくなった場合はTimelineか？
 *
 * @author shisyamo4131
 * @version 1.0.0
 * @updates
 * - version 1.0.0 - 初版作成
 */
import GCardSiteContract from '../molecules/cards/GCardSiteContract.vue'
import GBtnRegistIcon from '../atoms/btns/GBtnRegistIcon.vue'
import GInputSiteContract from '../molecules/inputs/GInputSiteContract.vue'
import GDialogInput from '../molecules/dialogs/GDialogInput.vue'
import GEditModeMixin from '~/mixins/GEditModeMixin'
import Site from '~/models/Site'
import SiteContract from '~/models/SiteContract'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GCardSiteContract,
    GBtnRegistIcon,
    GInputSiteContract,
    GDialogInput,
  },
  /***************************************************************************
   * MIXINS
   ***************************************************************************/
  mixins: [GEditModeMixin],
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    instance: {
      type: Object,
      required: true,
      validator: (instance) => instance instanceof Site,
    },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      allowedDates: (val) => !this.items.some((item) => item.startDate === val),
      dialog: false,
      editModel: new SiteContract(),
      items: [],
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
    dialog(v) {
      if (v && this.editMode === this.CREATE) {
        this.editModel.initialize({
          siteId: this.instance.docId,
        })
      }
      if (!v) {
        this.editMode = this.CREATE
        this.editModel.initialize()
      }
    },
    instance: {
      handler(v) {
        if (!v.docId) return
        this.items = v.subscribeContracts()
      },
      immediate: true,
      deep: true,
    },
  },
  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.instance.unsubscribeContracts()
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    onClickEdit(item) {
      this.editMode = this.UPDATE
      this.editModel.initialize(item)
      this.dialog = true
    },
  },
}
</script>

<template>
  <div>
    <v-tabs v-model="workShift" class="pb-2">
      <v-tab tab-value="day">日勤</v-tab>
      <v-tab tab-value="night">夜勤</v-tab>
      <v-spacer />
      <g-dialog-input v-model="dialog">
        <template #activator="{ attrs, on }">
          <g-btn-regist-icon
            v-bind="attrs"
            class="align-self-center"
            color="primary"
            v-on="on"
          />
        </template>
        <template #default="{ attrs, on }">
          <g-input-site-contract
            v-bind="attrs"
            :instance="editModel"
            :edit-mode="editMode"
            hide-site
            v-on="on"
          />
        </template>
      </g-dialog-input>
    </v-tabs>
    <v-tabs-items v-model="workShift">
      <v-tab-item value="day">
        <g-card-site-contract
          v-if="!!dayContracts.length"
          outlined
          :instance="dayContracts[0]"
          @click:edit="onClickEdit(dayContracts[0])"
        />
      </v-tab-item>
      <v-tab-item value="night">
        <g-card-site-contract
          v-if="!!nightContracts.length"
          outlined
          :instance="nightContracts[0]"
          @click:edit="onClickEdit(nightContracts[0])"
        />
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<style></style>
