<script>
/**
 * 現場取極め情報の一覧ページです。
 * @author shisyamo4131
 * @refact 2025-01-27
 */
import AirArrayManager from '~/components/air/AirArrayManager.vue'
import GBtnRegist from '~/components/atoms/btns/GBtnRegist.vue'
import GDialogSiteSelector from '~/components/molecules/dialogs/GDialogSiteSelector.vue'
import GInputSiteContract from '~/components/molecules/inputs/GInputSiteContract.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import SiteContract from '~/models/SiteContract'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'SiteContractsIndex',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTemplateDefault,
    GInputSiteContract,
    AirArrayManager,
    GBtnRegist,
    GDialogSiteSelector,
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      items: [],
      schema: new SiteContract(),
      selectedSiteId: null,
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    computedSelectedSiteId: {
      get() {
        return this.selectedSiteId
      },
      set(v) {
        if (!v || !Array.isArray(v) || v.length === 0) {
          this.selectedSiteId = null
        } else {
          this.selectedSiteId = v[0].docId || null
        }
      },
    },
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    computedSelectedSiteId: {
      handler(v) {
        this.subscribe()
      },
      immediate: true,
    },
  },

  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.schema.unsubscribe()
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    async handleCreate(item) {
      await item.create()
    },
    async handleUpdate(item) {
      await item.update()
    },
    async handleDelete(item) {
      await item.delete()
    },

    /**
     * 現場取極め情報の購読を開始します。
     */
    subscribe() {
      this.unsubscribe()
      if (!this.computedSelectedSiteId) return
      this.items = this.schema.subscribeDocs([
        ['where', 'siteId', '==', this.computedSelectedSiteId],
      ])
    },

    /**
     * 現場取極め情報の購読を解除します。
     */
    unsubscribe() {
      this.schema.unsubscribe()
    },
  },
}
</script>

<template>
  <g-template-default v-slot="{ height }">
    <v-container fluid :style="{ height: `${height}px` }">
      <air-array-manager
        :dialog-props="{
          maxWidth: 600,
        }"
        event-edit="click:row"
        :handle-create="handleCreate"
        :handle-update="handleUpdate"
        :handle-delete="handleDelete"
        height="100%"
        :items="items"
        label="現場取極め情報"
        :schema="schema"
      >
        <template #default="props">
          <v-sheet class="d-flex flex-column" :height="props.height">
            <v-toolbar class="flex-grow-0" flat>
              <g-dialog-site-selector
                :items="$store.getters['sites/items']"
                @click:submit="computedSelectedSiteId = $event"
              >
                <template #activator="{ attrs, on }">
                  <v-select
                    v-bind="attrs"
                    v-model="computedSelectedSiteId"
                    append-icon=""
                    clearable
                    hide-details
                    :items="$store.getters['sites/items']"
                    item-text="abbr"
                    item-value="docId"
                    placeholder="現場を選択"
                    prepend-inner-icon="mdi-magnify"
                    readonly
                    v-on="on"
                  />
                </template>
              </g-dialog-site-selector>
              <g-btn-regist
                v-bind="props.activator.attrs"
                icon
                v-on="props.activator.on"
              />
            </v-toolbar>
            <div class="flex-table-container">
              <v-data-table
                v-bind="props.table.attrs"
                :headers="[
                  { text: '開始日', value: 'startDate' },
                  { text: '勤務区分', value: 'workShift' },
                ]"
                hide-default-footer
                sort-by="startDate"
                sort-desc
                v-on="props.table.on"
              >
              </v-data-table>
            </div>
            <v-container fluid>
              <v-row justify="center">
                <v-col cols="10">
                  <v-pagination
                    v-bind="props.pagination.attrs"
                    v-on="props.pagination.on"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-sheet>
        </template>
        <template #inputs="{ attrs, on }">
          <g-input-site-contract v-bind="attrs" v-on="on" />
        </template>
      </air-array-manager>
    </v-container>
  </g-template-default>
</template>

<style></style>
