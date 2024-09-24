<script>
/**
 * ## GCardSiteOperationScheduleHistories
 *
 * 現場の稼働予定の変更履歴を表示するコンポーネントです。
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.0.0 - 2024-09-17 - 初版作成
 */
import GCardSiteOperationScheduleHistory from './GCardSiteOperationScheduleHistory.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GCardSiteOperationScheduleHistory },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    items: { type: Array, default: () => [], required: false },
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    sortedItems() {
      return this.items.slice().sort((a, b) => {
        if (a.id < b.id) return 1
        if (a.id > b.id) return -1
        return 0
      })
    },
  },
}
</script>

<template>
  <v-card v-bind="$attrs" v-on="$listeners">
    <v-container>
      <v-timeline dense>
        <v-slide-x-transition group>
          <v-timeline-item v-for="item of sortedItems" :key="item.id" small>
            <g-card-site-operation-schedule-history v-bind="item" />
          </v-timeline-item>
        </v-slide-x-transition>
      </v-timeline>
    </v-container>
  </v-card>
</template>

<style></style>
