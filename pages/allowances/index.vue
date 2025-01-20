<script>
/**
 * 手当マスタ情報の一覧ページです。
 * @author shisyamo4131
 * @refact 2025-01-20
 */
import AirArrayManager from '~/components/air/AirArrayManager.vue'
import GBtnRegist from '~/components/atoms/btns/GBtnRegist.vue'
import GChipSyncStatus from '~/components/atoms/chips/GChipSyncStatus.vue'
import GIconPlay from '~/components/atoms/icons/GIconPlay.vue'
import GIconStop from '~/components/atoms/icons/GIconStop.vue'
import GInputAllowance from '~/components/molecules/inputs/GInputAllowance.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import Allowance from '~/models/Allowance'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'AllowancesIndex',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTemplateDefault,
    GBtnRegist,
    GIconPlay,
    GIconStop,
    GInputAllowance,
    GChipSyncStatus,
    AirArrayManager,
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      schema: new Allowance(),
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * DataTable のカラム設定です。
     */
    headers() {
      const template = [
        { text: '手当名', value: 'name' },
        { text: '支給形態', value: 'paymentType' },
        {
          text: '時間外基礎',
          value: 'isIncludedInOvertimeBase',
        },
      ]

      return template
    },

    /**
     * DataTable に表示するアイテムです。
     * - Vuex から取得します。
     */
    items() {
      return this.$store.getters['allowances/items']
    },
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
    // Vuex が Firestore ドキュメントを読み込んでいるためコンバーター不要
    // async itemConverter(item) {
    //   return await this.schema.fetchDoc(item.docId)
    // },
  },
}
</script>

<template>
  <g-template-default v-slot="{ height }">
    <v-container fluid :style="{ height: `${height}px` }">
      <air-array-manager
        v-bind="$attrs"
        :dialog-props="{
          maxWidth: 360,
        }"
        event-edit="click:row"
        :handle-create="handleCreate"
        :handle-update="handleUpdate"
        :handle-delete="handleDelete"
        height="100%"
        :items="items"
        label="手当マスタ情報"
        :schema="schema"
        v-on="$listeners"
      >
        <template #default="{ activator, pagination, search, table }">
          <v-sheet class="d-flex flex-column" height="100%">
            <v-toolbar class="flex-grow-0" flat>
              <v-text-field v-bind="search.attrs" v-on="search.on" />
              <g-btn-regist v-bind="activator.attrs" icon v-on="activator.on" />
            </v-toolbar>
            <div class="flex-table-container">
              <v-data-table
                v-bind="table.attrs"
                fixed-header
                :headers="headers"
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
            <v-container fluid>
              <v-row justify="center">
                <v-col cols="10">
                  <v-pagination
                    v-bind="pagination.attrs"
                    v-on="pagination.on"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-sheet>
        </template>
        <template #inputs="{ attrs, on }">
          <g-input-allowance v-bind="attrs" v-on="on" />
        </template>
      </air-array-manager>
    </v-container>
  </g-template-default>
</template>

<style></style>
