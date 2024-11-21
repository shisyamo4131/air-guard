<script>
/**
 * 現場-勤務区分並べ替え用コンポーネントです。
 *
 * @author shisyamo4131
 */
import draggable from 'vuedraggable'
import GBtnCancelIcon from '~/components/atoms/btns/GBtnCancelIcon.vue'
import GBtnSubmitIcon from '~/components/atoms/btns/GBtnSubmitIcon.vue'
import GChipWorkShift from '~/components/atoms/chips/GChipWorkShift.vue'
import GIconUpDown from '~/components/atoms/icons/GIconUpDown.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    draggable,
    GBtnCancelIcon,
    GBtnSubmitIcon,
    GChipWorkShift,
    GIconUpDown,
  },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    label: { type: String, default: '現場並べ替え', required: false },
    loading: { type: Boolean, default: false, required: false },
    siteOrder: { type: Array, default: () => [], required: false },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      internalSiteOrder: [],
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    computedSiteOrder() {
      return this.internalSiteOrder.map((order) => {
        const site = this.$store.getters['sites/get'](order.siteId)
        return {
          ...order,
          siteAbbr: site?.abbr || 'N/A',
        }
      })
    },
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    siteOrder: {
      handler(v) {
        this.internalSiteOrder = v
      },
      immediate: true,
    },
  },
}
</script>

<template>
  <v-card
    v-bind="$attrs"
    class="d-flex flex-column"
    :tile="$vuetify.breakpoint.mobile"
    v-on="$listeners"
  >
    <v-toolbar class="flex-grow-0" color="secondary" dark dense flat>
      <v-icon left>mdi-order-alphabetical-ascending</v-icon>
      <v-toolbar-title>{{ label }}</v-toolbar-title>
      <v-spacer />
      <g-btn-cancel-icon :disabled="loading" @click="$emit('click:close')" />
    </v-toolbar>
    <v-card-text class="py-0 px-0 px-md-6">
      <draggable
        v-bind="{ animation: 300 }"
        v-model="internalSiteOrder"
        tag="v-list"
        handle=".handle"
        :disabled="loading"
      >
        <div v-for="(order, index) in computedSiteOrder" :key="index">
          <v-list-item :dense="$vuetify.breakpoint.mobile">
            <v-list-item-content>
              <v-list-item-title>
                <g-chip-work-shift
                  :value="order.workShift"
                  class="mr-2"
                  :small="!$vuetify.breakpoint.mobile"
                  :x-small="$vuetify.breakpoint.mobile"
                />
                {{ order.siteAbbr }}
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
      <g-btn-submit-icon
        color="primary"
        :disabled="loading"
        :loading="loading"
        @click="$emit('click:submit', internalSiteOrder)"
      />
    </v-card-actions>
  </v-card>
</template>

<style></style>
