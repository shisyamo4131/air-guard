<script>
/**
 * ## GSiteOperationScheduleHistory
 *
 * 現場の稼働予定の変更履歴を表示するコンポーネントです。
 *
 * @author shisyamo4131
 * @version 1.1.0
 *
 * @updates
 * - version 1.1.0 - 2024-07-30 - 更新履歴の表示部分を`GCardSiteOperationScheduleHistory`としてコンポーネント化
 *                              - `props.from`、`props.to`を追加。
 *                              - 更新履歴の取得について、`date`の範囲指定を追加。
 *                              - `watch.siteId`を削除し、`lifecycle.create`に`$watch`を追加。
 * - version 1.0.0 - 2024-07-29 - 初版作成
 */
import {
  endAt,
  onChildAdded,
  orderByChild,
  query,
  ref,
  startAt,
} from 'firebase/database'
import GCardSiteOperationScheduleHistory from '../molecules/cards/GCardSiteOperationScheduleHistory.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GCardSiteOperationScheduleHistory },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    siteId: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      items: [],
      listener: null,
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    sortedItems() {
      return this.items.slice().reverse()
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {},
  /***************************************************************************
   * CREATED
   ***************************************************************************/
  created() {
    this.$watch(
      () => [this.$props.siteId, this.$props.from, this.$props.to],
      (newVal, oldVal) => {
        const after = {
          siteId: newVal[0],
          from: newVal[1],
          to: newVal[2],
        }
        const before = {
          siteId: oldVal?.[0] || undefined,
          from: oldVal?.[1] || undefined,
          to: oldVal?.[2] || undefined,
        }
        if (JSON.stringify(after) !== JSON.stringify(before)) {
          this.items.splice(0)
          this.subscribe()
        }
      },
      { immediate: true }
    )
  },
  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    if (this.listener) this.listener()
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    subscribe() {
      if (!this.siteId || !this.from || !this.to) return
      const path = `History/SiteOperationSchedules/${this.siteId}`
      const dbRef = ref(this.$database, path)
      const q = query(
        dbRef,
        orderByChild('date'),
        startAt(this.from),
        endAt(this.to)
      )
      this.listener = onChildAdded(q, (snapshot) => {
        this.items.push({ ...snapshot.val(), id: snapshot.key })
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
