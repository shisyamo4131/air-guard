<script>
/**
 * ### GListItemSiteOperationSchedule
 *
 * 現場の稼働予定情報を表示するためのListItemコンポーネントです。
 * `props.event`にイベントオブジェクトを受け取り、適宜表示します。
 *
 * @component
 * @example
 * <GListItemSiteOperationSchedule
 *   :event="event"
 * />
 *
 * @props {Object} event - 現場の稼働予定イベントオブジェクト
 *
 * @author shisyamo4131
 * @create 2024-06-18
 */
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    event: { type: Object, required: true },
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    address() {
      return this.event?.site?.address || 'error'
    },
    end() {
      return this.event?.schedule?.end || 'error'
    },
    name() {
      return this.event?.site?.name || 'error'
    },
    start() {
      return this.event?.schedule?.start || 'error'
    },
    workShift() {
      return this.event?.schedule?.workShift || 'error'
    },
  },
}
</script>

<template>
  <v-list-item
    :class="`g-list-item--site-operation-schedule-${workShift}`"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <v-list-item-action class="mr-3">
      <div>{{ start }}</div>
      <div>{{ end }}</div>
    </v-list-item-action>
    <v-list-item-content>
      <v-list-item-title>
        {{ name }}
      </v-list-item-title>
      <v-list-item-subtitle>
        {{ address }}
      </v-list-item-subtitle>
    </v-list-item-content>
  </v-list-item>
</template>

<style></style>
