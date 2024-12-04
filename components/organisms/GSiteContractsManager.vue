<script>
/**
 * 現場の取極め情報を管理するコンポーネントです。
 * @author shisyamo4131
 */
import GCardSiteContract from '../molecules/cards/GCardSiteContract.vue'
import GBtnRegistIcon from '../atoms/btns/GBtnRegistIcon.vue'
import GInputSiteContract from '../molecules/inputs/GInputSiteContract.vue'
import GDialogInput from '../molecules/dialogs/GDialogInput.vue'
import GMixinEditModeProvider from '~/mixins/GMixinEditModeProvider'
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
  mixins: [GMixinEditModeProvider],
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
      contractInstance: new SiteContract(),
      dialog: false,
      editModel: new SiteContract(),
      errorMessage: null,
      items: [],
      loadingSite: false,
      siteInstance: new Site(),
      tab: null,
      workShift: 'day',
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
          // siteId: this.instance.docId,
          siteId: this.siteId,
        })
      }
      if (!v) {
        this.editMode = this.CREATE
        this.editModel.initialize()
      }
    },

    siteId: {
      async handler(v) {
        this.loadingSite = true
        this.errorMessage = null
        try {
          const isFetched = await this.siteInstance.fetch(v)
          if (!isFetched) {
            this.errorMessage = '現場情報の読み込みに失敗しました。'
            return
          }
          this.items = this.contractInstance.subscribeDocs([
            ['where', 'siteId', '==', v],
          ])
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(err)
          this.errorMessage = '現場情報の読み込みに失敗しました。'
        } finally {
          this.loadingSite = false
        }
      },
      immediate: true,
    },
  },
  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.contractInstance.unsubscribe()
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
            :disabled="loadingSite || !!errorMessage"
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
    <v-alert v-if="errorMessage" dense type="error" text>{{
      errorMessage
    }}</v-alert>

    <v-tabs-items v-else v-model="workShift">
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
