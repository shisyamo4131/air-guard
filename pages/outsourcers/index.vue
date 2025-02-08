<script>
/**
 * 外注先情報の一覧ページです。
 * @author shisyamo4131
 * @refact 2025-02-08
 */
import AirRenderlessDelayInput from '~/components/air/AirRenderlessDelayInput.vue'
import GBtnRegist from '~/components/atoms/btns/GBtnRegist.vue'
import GChipSyncStatus from '~/components/atoms/chips/GChipSyncStatus.vue'
import GIconPlay from '~/components/atoms/icons/GIconPlay.vue'
import GIconStop from '~/components/atoms/icons/GIconStop.vue'
import GPagination from '~/components/atoms/paginations/GPagination.vue'
import GCollectionManagerOutsourcers from '~/components/managers/GCollectionManagerOutsourcers.vue'
import GInputOutsourcer from '~/components/molecules/inputs/GInputOutsourcer.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import Outsourcer from '~/models/Outsourcer'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'OutsourcersIndex',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTemplateDefault,
    GBtnRegist,
    GIconPlay,
    GIconStop,
    GInputOutsourcer,
    GChipSyncStatus,
    GPagination,
    GCollectionManagerOutsourcers,
    AirRenderlessDelayInput,
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      items: [],
      lazySearch: null,
      loading: false,
      instance: new Outsourcer(),
    }
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    lazySearch: {
      handler(v) {
        this.items = []
        if (v) this.subscribeDocs(v)
      },
      immediate: true,
    },
  },

  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.instance.unsubscribe()
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    async subscribeDocs(search) {
      this.loading = true
      try {
        this.items = await this.instance.subscribeDocs(search)
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('subscribeDocs に失敗しました。')
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<template>
  <g-template-default v-slot="{ height }">
    <v-container fluid :style="{ height: `${height}px` }">
      <g-collection-manager-outsourcers
        event-edit="click:row"
        height="100%"
        :items="items"
        :loading="loading"
      >
        <template #default="{ activator, pagination, table }">
          <v-sheet class="d-flex flex-column" height="100%">
            <v-toolbar class="flex-grow-0" flat>
              <air-renderless-delay-input v-model="lazySearch">
                <template #default="{ attrs, on }">
                  <v-text-field
                    v-bind="attrs"
                    clearable
                    hide-details
                    placeholder="外注先名で検索"
                    prepend-inner-icon="mdi-magnify"
                    v-on="on"
                  />
                </template>
              </air-renderless-delay-input>
              <g-btn-regist v-bind="activator.attrs" icon v-on="activator.on" />
            </v-toolbar>
            <div class="flex-table-container">
              <v-data-table
                v-bind="table.attrs"
                fixed-header
                :headers="[
                  { text: 'CODE', value: 'code', width: 84 },
                  { text: '外注先名', value: 'abbr' },
                  { text: '住所1', value: 'address1', sortable: false },
                  {
                    text: '同期状態',
                    value: 'sync',
                    sortable: false,
                    align: 'center',
                  },
                ]"
                hide-default-footer
                item-key="docId"
                v-on="table.on"
              >
                <template #[`item.abbr`]="{ item }">
                  <div class="d-flex">
                    <g-icon-play
                      v-if="item.status === 'active'"
                      color="green"
                      left
                      small
                    />
                    <g-icon-stop v-else color="red" left small />
                    <div>{{ item.name }}</div>
                  </div>
                </template>
                <template #[`item.sync`]="{ item }">
                  <g-chip-sync-status :value="item.sync" x-small />
                </template>
              </v-data-table>
            </div>
            <g-pagination v-bind="pagination.attrs" v-on="pagination.on" />
          </v-sheet>
        </template>
        <template #inputs="{ attrs, on }">
          <g-input-outsourcer v-bind="attrs" v-on="on" />
        </template>
      </g-collection-manager-outsourcers>
    </v-container>
  </g-template-default>
</template>

<style></style>
