<script>
/**
 * 現場-勤務区分配列データを並べ替えるためのダイアログコンポーネントです。
 *
 * - site-order を value で受け取り、編集後の配列を input イベントで emit します。
 * - activator スロットを利用して起動の為のボタンを置換可能です。
 *
 * @author shisyamo4131
 */
import draggable from 'vuedraggable'
import GBtnCancelIcon from '../atoms/btns/GBtnCancelIcon.vue'
import GBtnSubmitIcon from '../atoms/btns/GBtnSubmitIcon.vue'
import GChipWorkShift from '../atoms/chips/GChipWorkShift.vue'
import GIconUpDown from '../atoms/icons/GIconUpDown.vue'
export default {
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  components: {
    draggable,
    GBtnCancelIcon,
    GChipWorkShift,
    GBtnSubmitIcon,
    GIconUpDown,
  },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    label: { type: String, default: '現場並べ替え', required: false },
    value: { type: Array, default: () => [], required: false },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dialog: false,
      internalValue: [],
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    computedValue() {
      return this.internalValue.map((order) => {
        const site = this.$store.getters['sites/get'](order.siteId)
        const customer = site
          ? this.$store.getters['customers/get'](site.customerId)
          : null
        return {
          ...order,
          siteId: site?.docId || 'N/A',
          siteCode: site?.code || 'N/A',
          siteAbbr: site?.abbr || 'N/A',
          customerId: customer?.docId || 'N/A',
          customerCode: customer?.code || 'N/A',
          customerAbbr: customer?.abbr || 'N/A',
        }
      })
    },
    /**
     * モバイル表示かどうかを判定します。
     */
    isMobile() {
      return this.$vuetify.breakpoint.mobile
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    dialog(v) {
      if (v) return
      const wrapper = this.$refs.scrollContainer
      if (wrapper) wrapper.scrollTo({ top: 0 })
    },

    value: {
      handler(v) {
        this.internalValue = v
      },
      immediate: true,
    },
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  methods: {
    onClickSubmit() {
      this.$emit('input', this.internalValue)
      this.dialog = false
    },
  },
}
</script>

<template>
  <v-dialog
    v-model="dialog"
    max-width="600"
    :fullscreen="$vuetify.breakpoint.mobile"
    scrollable
  >
    <template #activator="{ attrs, on }">
      <v-btn v-bind="{ ...$attrs, ...attrs }" v-on="{ ...$listeners, ...on }">
        <v-icon :left="!isMobile">mdi-order-alphabetical-ascending</v-icon>
        <span v-if="!isMobile">並べ替え</span>
      </v-btn>
    </template>

    <v-card class="d-flex flex-column" :tile="$vuetify.breakpoint.mobile">
      <v-toolbar class="flex-grow-0" color="secondary" dark dense flat>
        <v-icon left>mdi-order-alphabetical-ascending</v-icon>
        <v-toolbar-title>{{ label }}</v-toolbar-title>
        <v-spacer />
        <g-btn-cancel-icon @click="dialog = false" />
      </v-toolbar>
      <v-card-text ref="scrollContainer" class="py-0 px-0 px-md-6">
        <draggable
          v-bind="{ animation: 300 }"
          v-model="internalValue"
          tag="v-list"
          handle=".handle"
        >
          <div v-for="(order, index) in computedValue" :key="index">
            <v-list-item :dense="$vuetify.breakpoint.mobile">
              <v-list-item-content>
                <v-list-item-title>
                  <div class="d-flex">
                    <g-chip-work-shift
                      :value="order.workShift"
                      class="mr-2 align-self-center flex-shrink-0"
                      :small="!$vuetify.breakpoint.mobile"
                      :x-small="$vuetify.breakpoint.mobile"
                    />
                    <div class="overflow-y-hidden">
                      <div class="text-truncate">
                        <!-- 開発者用 -->
                        <span v-if="$store.getters['auth/isDeveloper']">
                          {{ `[${order.siteId}]` }}
                        </span>
                        <span v-else>
                          {{ `[${order.siteCode}]` }}
                        </span>
                        {{ order.siteAbbr }}
                      </div>
                      <div class="text-caption grey--text">
                        <!-- 開発者用 -->
                        <span v-if="$store.getters['auth/isDeveloper']">
                          {{ `[${order.customerId}]` }}
                        </span>
                        <span v-else>
                          {{ `[${order.customerCode}]` }}
                        </span>
                        {{ order.customerAbbr }}
                      </div>
                    </div>
                  </div>
                </v-list-item-title>
              </v-list-item-content>
              <v-list-item-icon>
                <g-icon-up-down class="handle" />
              </v-list-item-icon>
            </v-list-item>
            <v-divider />
          </div>
        </draggable>
      </v-card-text>
      <v-card-actions class="justify-end">
        <g-btn-submit-icon color="primary" @click="onClickSubmit" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style></style>
