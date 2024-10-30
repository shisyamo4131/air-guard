<script>
import GChipWorkShift from '~/components/atoms/chips/GChipWorkShift.vue'
/**
 * PlacementSiteWorkShiftRow
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GChipWorkShift },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * Identifier in the format "${siteId}-${workShift}".
     * - Represents the combination of site and work shift.
     */
    siteWorkShiftId: { type: String, required: true },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      items: [
        {
          title: '詳細情報を表示',
          icon: 'information',
          on: { click: () => this.onClickShowDetail() },
        },
        {
          title: 'この現場を除外',
          icon: 'playlist-minus',
          on: { click: () => this.onClickRemove() },
        },
      ],
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * Retrieves the customer information based on the customerId from site.
     * - Returns null if site is not available.
     */
    customer() {
      if (!this.site) return null
      const customerId = this.site.customerId
      return this.$store.getters['customers/get'](customerId)
    },

    /**
     * Retrieves the site information based on the siteId extracted from siteWorkShiftId.
     * - Returns null if siteWorkShiftId is not set.
     */
    site() {
      if (!this.siteWorkShiftId) return null
      const [siteId] = this.siteWorkShiftId.split('-')
      return this.$store.getters['sites/get'](siteId)
    },

    /**
     * Extracts the work shift from the siteWorkShiftId prop.
     * - Returns null if siteWorkShiftId is not set or the work shift is unavailable.
     */
    workShift() {
      if (!this.siteWorkShiftId) return null
      const parts = this.siteWorkShiftId.split('-')
      return parts[1] || null
    },
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * Emits a click:remove event to notify the parent component of an remove action.
     */
    onClickRemove() {
      this.$emit('click:remove')
    },

    /**
     * Emits a click:show-detail event with site and customer details.
     * - Passes an object containing site and customer data as parameters to the parent component.
     */
    onClickShowDetail() {
      const params = {
        site: this.site,
        customer: this.customer,
      }
      this.$emit('click:show-detail', params)
    },
  },
}
</script>

<template>
  <div class="py-2">
    <div class="text-body-1 d-flex align-center">
      <v-menu offset-y>
        <template #activator="{ attrs, on }">
          <v-icon v-bind="attrs" left small v-on="on">mdi-dots-vertical</v-icon>
        </template>
        <v-list dense>
          <v-list-item
            v-for="(item, index) in items"
            :key="index"
            v-on="item.on"
          >
            <v-list-item-title>
              <v-icon v-if="item?.icon" left small>
                {{ `mdi-${item.icon}` }}
              </v-icon>
              {{ item.title }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <g-chip-work-shift class="mr-2" :value="workShift" x-small />
      {{ site?.abbr || 'undefined' }}
    </div>
    <div class="text-caption pl-6">
      {{ customer?.abbr || 'undefined' }}
    </div>
  </div>
</template>

<style></style>
