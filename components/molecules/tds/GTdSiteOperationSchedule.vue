<script>
/**
 * ## GTdSiteOperationSchedule
 *
 * 稼働予定一覧表の稼働数を表すTDコンポーネントです。
 * `props.date`と`props.siteId`を元にRealtime Databaseから該当する現場・日付の
 * 稼働予定を取得して表示します。
 *
 * また、稼働予定数はVChipコンポーネントを利用して表示されます。
 * VChipコンポーネントをクリックすると`click`イベントがemitされます。
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.0.0 - 初版作成
 */
import { onValue, ref } from 'firebase/database'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  props: {
    /**
     * 表示する稼働予定日を指定します。
     */
    date: { type: String, required: true },
    /**
     * 表示対象の現場のドキュメントidを指定します。
     */
    siteId: { type: String, required: true },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      /**
       * 取得した稼働予定データ
       */
      item: { day: null, night: null },
      /**
       * Realtime Databaseへのリスナー
       */
      listener: null,
    }
  },
  /***************************************************************************
   * CREATED
   ***************************************************************************/
  created() {
    this.$watch(
      () => [this.$props.date, this.$props.siteId],
      (newVal, oldVal) => {
        const after = {
          date: newVal?.[0] || undefined,
          siteId: newVal?.[1] || undefined,
        }
        const before = {
          date: oldVal?.[0] || undefined,
          siteId: oldVal?.[1] || undefined,
        }
        if (JSON.stringify(after) === JSON.stringify(before)) return
        this.subscribe()
      },
      { immediate: true }
    )
  },
  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    if (this.listener) this.listener()
    this.listener = null
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * Realtime Databaseへのリスナーをセットします。
     */
    subscribe() {
      if (this.listener) this.listener()
      this.listener = null
      const [year, month, day] = this.date.split('-')
      const path = `SiteOperationSchedules/${year}/${month}/detail/${day}/${this.siteId}`
      this.listener = onValue(ref(this.$database, path), (snapshot) => {
        this.item.day = snapshot.val()?.day || null
        this.item.night = snapshot.val()?.night || null
      })
    },
  },
}
</script>

<template>
  <td>
    <div class="d-flex flex-column" style="row-gap: 4px">
      <v-chip
        v-for="workShift in [
          { value: 'day', color: 'blue' },
          { value: 'night', color: 'red' },
        ]"
        :key="workShift.value"
        :color="`${workShift.color} lighten-${
          item?.[workShift.value]?.requiredWorkers || 0 ? '2' : '5'
        }`"
        class="white--text text-caption justify-center"
        rounded
        x-small
        @click="$emit('click', { siteId, date, workShift: workShift.value })"
      >
        {{ item?.[workShift.value]?.requiredWorkers || 0 }}
      </v-chip>
    </div>
  </td>
</template>

<style></style>
