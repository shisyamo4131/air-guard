<script>
import GChipWorkShift from '~/components/atoms/chips/GChipWorkShift.vue'
/**
 * ## ArrangementSiteWorkShiftRow
 *
 * 配置表の現場勤務区分行に使用するコンポーネントです。
 *
 * @author shisyamo4131
 */
export default {
  components: { GChipWorkShift },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    // ${siteId}-${workShift}
    value: { type: String, required: true },
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
          on: { click: () => this.onClickExclude() },
        },
      ],
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    customer() {
      if (!this.site) return null
      const customerId = this.site.customerId
      return this.$store.getters['customers/get'](customerId)
    },
    site() {
      if (!this.value) return null
      const [siteId] = this.value.split('-')
      return this.$store.getters['sites/get'](siteId)
    },
    workShift() {
      if (!this.value) return null
      const parts = this.value.split('-')
      return parts[1] || null
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    onClickExclude() {
      if (!this.value) return
      this.$emit('click:exclude', this.value)
    },
    onClickShowDetail() {
      if (!this.value) return
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
