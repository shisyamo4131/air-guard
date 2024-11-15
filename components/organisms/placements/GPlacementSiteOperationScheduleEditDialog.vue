<script>
/**
 * ## GPlacementSiteOperationScheduleEditDialog
 *
 * 配置管理で現場の稼働予定を編集するためのコンポーネントです。
 * - props.instance で SiteOperationSchedule インスタンスを受け取ります。
 * - props.instance の docId が設定されていない場合は CREATE モード、
 *   設定されている場合は UPDATE モードになります。
 * - props.instance は date (dates), siteId, workShift が設定されていることを前提としています。
 *   よって、日付、現場、勤務区分については非表示になっています。
 *
 * NOTE:
 * 1. GPlacementDraggableCell から click:schedule イベントが emit される。
 *    この際、引数に SiteOperationSchedule インスタンスが設定されている。
 * 2. GPlacementTable がこのイベントを受け取り、このコンポーネントを開く。
 */
import GDialogInput from '~/components/molecules/dialogs/GDialogInput.vue'
import GInputSiteOperationSchedule from '~/components/molecules/inputs/GInputSiteOperationSchedule.vue'
import GEditModeMixin from '~/mixins/GEditModeMixin'
import SiteOperationSchedule from '~/models/SiteOperationSchedule'

export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GDialogInput,
    GInputSiteOperationSchedule,
  },

  /***************************************************************************
   * MIXINS
   ***************************************************************************/
  mixins: [GEditModeMixin],

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * SiteOperationSchedule インスタンスを受け取ります。
     */
    instance: {
      type: Object,
      validator: (instance) => instance instanceof SiteOperationSchedule,
      required: true,
    },
    value: { type: Boolean, default: false, required: false },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dialog: false,
    }
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    /**
     * data.dialog を監視します。
     * - 値を input イベントで emit します。
     */
    dialog(v) {
      this.$emit('input', v)
    },

    /**
     * props.instance の状態に応じて editMode を切り替えます。
     */
    instance: {
      handler(newInstance) {
        this.editMode = newInstance?.docId ? this.UPDATE : this.CREATE
      },
      immediate: true,
    },

    /**
     * props.value を監視します。
     * - 値を data.dialog に同期します。
     */
    value: {
      handler(v) {
        this.dialog = v
      },
      immediate: true,
    },
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * 外部から当該コンポーネントを開くためのメソッドです。
     */
    open() {
      this.dialog = true
    },
  },
}
</script>

<template>
  <g-dialog-input
    v-bind="$attrs"
    v-model="dialog"
    max-width="360"
    v-on="$listeners"
  >
    <template #default="{ attrs, on }">
      <g-input-site-operation-schedule
        v-bind="{ ...$props, editMode, ...attrs }"
        hide-date
        hide-site
        hide-work-shift
        v-on="on"
      />
    </template>
  </g-dialog-input>
</template>

<style></style>
