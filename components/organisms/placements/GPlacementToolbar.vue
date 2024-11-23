<script>
/**
 * ## GPlacementToolbar
 *
 * 配置管理画面のツールバー
 *
 * @author shisyamo4131
 */
import GSiteOrderManager from '../GSiteOrderManager.vue'
import GPlacementAvailabilityDialog from './GPlacementAvailabilityDialog.vue'
import GPlacementSiteSelector from './GPlacementSiteSelector.vue'

export default {
  components: {
    GPlacementSiteSelector,
    GPlacementAvailabilityDialog,
    GSiteOrderManager,
  },

  props: {
    columns: { type: Array, default: () => [], required: false },
  },

  computed: {
    /**
     * モバイル表示かどうかを判定します。
     */
    isMobile() {
      return this.$vuetify.breakpoint.mobile
    },
    /**
     * ボタンの属性を返します。
     */
    btnAttrs() {
      return {
        icon: this.isMobile, // モバイルの場合はアイコン表示
        text: !this.isMobile, // PCの場合はテキスト表示
      }
    },
    /**
     * コンポーネントを動的に切り替えます。
     * - PC: 'v-toolbar-items'
     * - モバイル: 'div'
     */
    component() {
      return this.isMobile ? 'div' : 'v-toolbar-items'
    },

    /**
     * Vuex の site-order と連携します。
     */
    siteOrder: {
      get() {
        return this.$store.state['site-order'].data
      },
      set(v) {
        this.$store.dispatch('site-order/update', v)
      },
    },
  },

  methods: {
    /**
     * 新しい現場をsite-orderに追加します。
     * @param {Object} payload - 現場IDと勤務区分の情報
     */
    async onNewSiteSelected({ siteId, workShift }) {
      try {
        await this.$store.dispatch('site-order/add', { siteId, workShift })
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to add site:', error)
      }
    },
  },
}
</script>

<template>
  <v-toolbar color="secondary" dark class="flex-grow-0" dense flat>
    <v-toolbar-title v-if="!isMobile">配置管理</v-toolbar-title>
    <v-spacer />
    <component :is="component">
      <!-- 前の週へボタン -->
      <!-- <v-btn v-bind="btnAttrs">
        <v-icon :left="!isMobile">mdi-chevron-left</v-icon>
        <span v-if="!isMobile">前の週へ</span>
      </v-btn> -->
      <!-- 次の週へボタン -->
      <!-- <v-btn v-bind="btnAttrs">
        <span v-if="!isMobile">次の週へ</span>
        <v-icon :right="!isMobile">mdi-chevron-right</v-icon>
      </v-btn> -->
      <!-- 現場追加ボタン -->
      <g-placement-site-selector @selected="onNewSiteSelected">
        <template #activator="{ attrs, on }">
          <v-btn v-bind="{ ...btnAttrs, ...attrs }" v-on="on">
            <v-icon :left="!isMobile">mdi-plus</v-icon>
            <span v-if="!isMobile">現場追加</span>
          </v-btn>
        </template>
      </g-placement-site-selector>
      <!-- 並べ替えボタン -->
      <g-site-order-manager v-model="siteOrder" text></g-site-order-manager>

      <!-- シフト管理ボタン -->
      <g-placement-availability-dialog :columns="columns">
        <template #activator="{ attrs, on }">
          <v-btn v-bind="{ ...btnAttrs, ...attrs }" v-on="on">
            <v-icon :left="!isMobile">mdi-calendar-account</v-icon>
            <span v-if="!isMobile">シフト管理</span>
          </v-btn>
        </template>
      </g-placement-availability-dialog>
    </component>
  </v-toolbar>
</template>

<style></style>
