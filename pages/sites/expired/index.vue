<script>
/**
 * ## pages.sites/expired/index
 *
 * 稼働終了した現場の一覧ページです。
 *
 * ### 機能詳細:
 * - Ngram検索を使用します。
 * - 検索対象は`status`が`active`以外のSiteドキュメントです。
 * - 検索結果をクリック（タップ）すると、`pages.sites._docId`に遷移します。
 *
 * ### 注意事項:
 * - Ngram検索の際、`status`を限定してしまうとtokenMapに対するFirestoreの
 *   インデックスが必要になってしまうため、検索結果をさらにcomputedで絞り込んでいます。
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.0.0 - 2024-07-31 - 初版作成
 */
import GDataTableSites from '~/components/molecules/tables/GDataTableSites.vue'
import GTemplateIndex from '~/components/templates/GTemplateIndex.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'SitesExpiredIndex',
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GTemplateIndex, GDataTableSites },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      items: [],
      lazySearch: null,
      loading: false,
      model: this.$Site(),
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    filterdItems() {
      return this.items.filter(({ status }) => status !== 'active')
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    lazySearch(newVal, oldVal) {
      if (newVal === oldVal) return
      this.fetchDocs()
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    async fetchDocs() {
      try {
        this.loading = true
        this.items = await this.model.fetchDocs(this.lazySearch)
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        alert(err.message)
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<template>
  <g-template-index :items="filterdItems" :lazy-search.sync="lazySearch">
    <template #default="{ attrs, on }">
      <g-data-table-sites
        v-bind="attrs"
        :loading="loading"
        @click:row="$router.push(`/sites/${$event.docId}`)"
        v-on="on"
      />
    </template>
  </g-template-index>
</template>

<style></style>
