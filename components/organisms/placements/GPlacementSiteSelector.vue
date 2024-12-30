<script>
/**
 * 配置管理で現場を選択するためのコンポーネントです。
 */
import { mapGetters } from 'vuex'
import GBtnCancel from '~/components/atoms/btns/GBtnCancel.vue'
import GBtnRegist from '~/components/atoms/btns/GBtnRegist.vue'
import GBtnSubmit from '~/components/atoms/btns/GBtnSubmit.vue'
import GChipSiteStatus from '~/components/atoms/chips/GChipSiteStatus.vue'
import GSwitch from '~/components/atoms/inputs/GSwitch.vue'
import GDialogInput from '~/components/molecules/dialogs/GDialogInput.vue'
import GInputSite from '~/components/molecules/inputs/GInputSite.vue'
import GRadioGroupWorkShift from '~/components/molecules/inputs/GRadioGroupWorkShift.vue'
import GTextFieldSearch from '~/components/molecules/inputs/GTextFieldSearch.vue'
import GMixinEditModeProvider from '~/mixins/GMixinEditModeProvider'
import Site from '~/models/Site'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTextFieldSearch,
    GBtnSubmit,
    GBtnCancel,
    GSwitch,
    GRadioGroupWorkShift,
    GBtnRegist,
    GDialogInput,
    GInputSite,
    GChipSiteStatus,
  },
  /***************************************************************************
   * MIXINS
   ***************************************************************************/
  mixins: [GMixinEditModeProvider],
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dialog: false,
      includesExpired: false,
      instance: new Site(),
      page: 1,
      pageCount: 0,
      scrollTargetRef: null,
      selectedItem: null,
      selectWorkShift: {
        dialog: false,
      },
      search: null,
      step: 1,
      workShift: 'day',
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    ...mapGetters('sites', { items: 'items' }),
    filteredItems() {
      return this.items.filter(({ status }) => {
        return this.includesExpired || status === 'active'
      })
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    dialog(v) {
      if (v) return
      this.selectedItem = null
      this.search = null
      this.workShift = 'day'
      this.selectWorkShift.dialog = false
      this.page = 1
      this.scrollTo()
    },
    page() {
      this.scrollTo()
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    onClickSubmit() {
      if (!this.selectedItem) return
      const siteId = this.selectedItem.docId
      const workShift = this.workShift
      this.$emit('selected', { siteId, workShift })
      this.dialog = false
    },

    /**
     * VDataIterator のスクロールを初期化
     */
    scrollTo(position = 0) {
      const container = this.scrollTargetRef
      if (!container) return
      this.$vuetify.goTo(this, { container })
    },
  },
}
</script>

<template>
  <v-dialog
    v-model="dialog"
    max-width="600"
    scrollable
    content-class="g-dialog__height--fixed"
    :fullscreen="$vuetify.breakpoint.mobile"
  >
    <template #activator="{ attrs, on }">
      <slot name="activator" v-bind="{ attrs, on }" />
    </template>
    <v-card class="d-flex flex-column" :tile="$vuetify.breakpoint.mobile">
      <v-toolbar class="flex-grow-0" color="secondary" dark dense flat>
        <v-toolbar-title>現場選択</v-toolbar-title>
        <v-spacer />
        <g-dialog-input :edit-mode.sync="editMode" :instance="instance">
          <template #activator="{ attrs, on }">
            <g-btn-regist icon v-bind="attrs" v-on="on" />
          </template>
          <template #default="{ attrs, on }">
            <g-input-site v-bind="attrs" v-on="on" />
          </template>
        </g-dialog-input>
      </v-toolbar>
      <v-toolbar class="flex-grow-0" flat>
        <g-text-field-search v-model="search" />
      </v-toolbar>
      <v-toolbar class="flex-grow-0" dense flat>
        <v-spacer />
        <g-switch
          v-model="includesExpired"
          class="mt-0"
          hide-details
          label="終了現場を含める"
        />
      </v-toolbar>
      <v-divider />
      <v-container class="py-0 px-0 flex-grow-1 overflow-y-auto">
        <v-data-iterator
          :ref="(el) => (scrollTargetRef = el)"
          :items="filteredItems"
          item-key="docId"
          :mobile-breakpoint="0"
          hide-default-footer
          :search="search"
          sort-by="code"
          sort-desc
          :page.sync="page"
          @page-count="pageCount = $event"
        >
          <template #default="props">
            <v-list-item-group
              v-model="selectedItem"
              active-class="primary--text"
            >
              <template v-for="(item, index) of props.items">
                <v-list-item
                  :key="`item-${index}`"
                  active-class="primary--text"
                  :dense="$vuetify.breakpoint.mobile"
                  :value="item"
                >
                  <template #default="{ active }">
                    <v-list-item-action>
                      <v-checkbox
                        :input-value="active"
                        color="primary"
                      ></v-checkbox>
                    </v-list-item-action>
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ item.abbr }}
                      </v-list-item-title>
                      <v-list-item-subtitle class="text-caption">
                        {{ item.address }}
                      </v-list-item-subtitle>
                      <slot name="third-line" v-bind="{ item }" />
                    </v-list-item-content>
                    <v-list-item-action>
                      <g-chip-site-status
                        class="ml-2"
                        :value="item.status"
                        x-small
                      />
                    </v-list-item-action>
                  </template>
                </v-list-item>
                <v-divider
                  v-if="index + 1 < props.items.length"
                  :key="`div-${index}`"
                />
              </template>
            </v-list-item-group>
          </template>
        </v-data-iterator>
      </v-container>
      <v-divider />
      <v-container style="max-width: 90%">
        <v-pagination v-model="page" :length="pageCount" />
      </v-container>
      <v-divider />
      <v-card-actions class="justify-space-between">
        <g-btn-cancel icon @click="dialog = false" />
        <v-dialog v-model="selectWorkShift.dialog" max-width="240" persistent>
          <template #activator="{ attrs, on }">
            <g-btn-submit
              icon
              v-bind="attrs"
              color="primary"
              :disabled="!selectedItem"
              v-on="on"
            />
          </template>
          <v-card>
            <v-toolbar color="secondary" dark dense flat>
              <v-toolbar-title>勤務区分選択</v-toolbar-title>
            </v-toolbar>
            <v-container class="d-flex justify-center">
              <g-radio-group-work-shift v-model="workShift" row />
            </v-container>
            <v-divider />
            <v-card-actions class="justify-space-between">
              <g-btn-cancel icon @click="selectWorkShift.dialog = false" />
              <g-btn-submit icon color="primary" @click="onClickSubmit" />
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style></style>
