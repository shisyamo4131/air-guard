<script>
/**
 * ## GInputTransportationCostApplication
 *
 * 交通費申請データ編集用コンポーネント
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.0.0 - 2024-08-14 - 初版作成
 */
import { props } from '~/models/TransportationCostApplication'
import EditMode from '~/mixins/GMixinEditMode'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {},
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  mixins: [props, EditMode],
}
</script>

<template>
  <div>
    <div>{{ employeeId }}</div>
    <div>{{ date }}</div>
    <div>{{ total }}</div>
    <div>{{ status }}</div>
    <div>{{ operationResults }}</div>
  </div>
</template>

<style></style>
