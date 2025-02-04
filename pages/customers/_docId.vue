<script>
/**
 * 取引先情報詳細画面
 * @author shisyamo4131
 * @refact 2025-02-04
 */
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import GBtnEdit from '~/components/atoms/btns/GBtnEdit.vue'
import AirItemManager from '~/components/air/AirItemManager.vue'
import Customer from '~/models/Customer'
import GInputCustomer from '~/components/molecules/inputs/GInputCustomer.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'CustomerDetail',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GTemplateDefault, GBtnEdit, AirItemManager, GInputCustomer },

  /***************************************************************************
   * ASYNCDATA
   ***************************************************************************/
  asyncData({ route }) {
    const docId = route.params.docId
    const listener = new Customer()
    listener.subscribe(docId)
    return { docId, listener }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    parentPath() {
      return this.$route.path.split('/').slice(0, -1).join('/')
    },
    breadcrumbs() {
      return [
        { text: 'TOP', to: '/' },
        { text: '取引先', to: this.parentPath, exact: true },
        { text: '取引先詳細', to: `${this.parentPath}/${this.docId}` },
      ]
    },

    /**
     * メイン情報として表示する項目の配列です。
     */
    mainProps() {
      return [
        { text: '住所1', value: 'address1' },
        { text: '住所2', value: 'address2' },
        { text: 'TEL', value: 'tel' },
        { text: 'FAX', value: 'fax' },
      ]
    },
  },
}
</script>

<template>
  <g-template-default>
    <v-breadcrumbs :items="breadcrumbs" />
    <v-container>
      <v-row>
        <!-- 取引先概要 -->
        <v-col cols="12" lg="4">
          <air-item-manager
            color="primary"
            :dialog-props="{ maxWidth: 600 }"
            :doc-id="docId"
            :handle-update="async (item) => await item.udpate()"
            :handle-delete="async (item) => await item.delete()"
            :item="listener"
            @DELETE="$router.replace('/customers')"
          >
            <template #default="{ attrs, on }">
              <v-card outlined>
                <v-card-title>{{ attrs.abbr }}</v-card-title>
                <v-card-subtitle>{{ attrs.abbrKana }}</v-card-subtitle>
                <v-list>
                  <v-list-item v-for="(prop, index) of mainProps" :key="index">
                    <v-list-item-content>
                      <v-list-item-subtitle>
                        {{ prop.text }}
                      </v-list-item-subtitle>
                      <v-list-item-title>
                        {{ attrs[prop.value] }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
                <v-card-actions class="justify-end">
                  <g-btn-edit
                    :color="attrs.color"
                    icon
                    @click="on['click:edit']"
                  />
                </v-card-actions>
              </v-card>
            </template>
            <template #inputs="{ attrs, on }">
              <g-input-customer v-bind="attrs" v-on="on" />
            </template>
          </air-item-manager>
        </v-col>
        <v-col cols="12" lg="8">
          <v-card outlined>
            <v-card-title>現場情報</v-card-title>
            <v-skeleton-loader type="table" />
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </g-template-default>
</template>

<style></style>
