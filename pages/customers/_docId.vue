<script>
/**
 * 取引先情報詳細画面
 * @author shisyamo4131
 * @refact 2025-01-17
 */
import GManagerCustomer from '~/components/managers/GManagerCustomer.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import GBtnEdit from '~/components/atoms/btns/GBtnEdit.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'CustomerDetail',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GTemplateDefault, GManagerCustomer, GBtnEdit },

  /***************************************************************************
   * ASYNCDATA
   ***************************************************************************/
  asyncData({ route }) {
    const docId = route.params.docId
    return { docId }
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
        <v-col cols="4">
          <g-manager-customer
            :doc-id="docId"
            color="primary"
            @DELETE="$router.replace('/customers')"
          >
            <template #default="{ attrs, on }">
              <v-card>
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
          </g-manager-customer>
        </v-col>
        <v-col cols="8">
          <v-alert type="info"
            >その他の情報を表示できる機能を実装予定です。</v-alert
          >
        </v-col>
      </v-row>
    </v-container>
  </g-template-default>
</template>

<style></style>
