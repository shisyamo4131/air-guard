<script>
/**
 * 非表示になっている現場-勤務区分があることをアラートするためのコンポーネントです。
 * `表示ボタン` を含んでおり、ユーザーがクリックすると対象の現場-勤務区分を Vuex.site-order に追加します。
 */
export default {
  props: {
    /**
     * コンポーネントの高さを減少させます。（規定値: true）
     */
    dense: { type: Boolean, default: true },

    /**
     * アラートの表示に outlineed を適用します。（規定値: true）
     */
    outlined: { type: Boolean, default: true },

    /**
     * アラートの表示に text を適用します。（規定値: true）
     */
    text: { type: Boolean, default: true },

    /**
     * アラートのタイプを指定します。（規定値: 'error'）
     */
    type: { type: String, default: 'error' },
  },

  computed: {
    /**
     * 稼働予定または配置割り当てがあるにも関わらず、表示されていない現場-勤務区分の配列を返します。
     * @returns {Array<id:string, siteId:string, workShift:string>} - 現場-勤務区分の配列
     */
    hiddenSites() {
      const siteOrder = this.$store.state['site-order'].data
      const assigned = this.$store.getters['assignments/siteWorkShifts']
      const scheduled =
        this.$store.getters['site-order/scheduledSiteWorkShifts']
      return [...new Set([...scheduled, ...assigned].map((site) => site.id))]
        .map((id) => {
          const [siteId, workShift] = id.split('-')
          return { id, siteId, workShift }
        })
        .filter(({ id }) => !siteOrder.some((order) => order.id === id))
    },
  },

  methods: {
    async addHiddenSitesToSiteOrder() {
      if (!this.hiddenSites.length) return
      await Promise.all(
        this.hiddenSites.map(({ siteId, workShift }) =>
          this.$store.dispatch('site-order/add', { siteId, workShift })
        )
      )
    },
  },
}
</script>

<template>
  <div>
    <v-expand-transition>
      <div v-show="hiddenSites.length" class="pa-2">
        <v-alert v-bind="{ ...$props, ...$attrs }">
          <v-row align="center">
            <v-col class="grow"> 非表示現場があります。 </v-col>
            <v-col class="shrink">
              <v-btn color="error" small @click="addHiddenSitesToSiteOrder"
                >表示する</v-btn
              >
            </v-col>
          </v-row>
        </v-alert>
      </div>
    </v-expand-transition>
  </div>
</template>

<style></style>
