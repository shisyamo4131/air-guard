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
            height="100%"
            :item="listener"
            label="取引先情報編集"
            @DELETE="$router.replace('/customers')"
          >
            <template #default="{ attrs, height, on }">
              <v-card class="d-flex flex-column" outlined :height="height">
                <v-card-title>{{ attrs.abbr }}</v-card-title>
                <v-card-subtitle>{{ attrs.abbrKana }}</v-card-subtitle>
                <v-list class="flex-grow-1">
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon>mdi-map-marker</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ attrs.address1 }}
                      </v-list-item-title>
                      <v-list-item-subtitle>
                        {{ attrs.address2 }}
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon>mdi-phone</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ attrs.tel }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon>mdi-fax</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ attrs.fax }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon>mdi-calendar</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>
                        {{
                          `${$DEADLINE[attrs.deadline]}締め ${
                            attrs.depositMonth
                          }ヶ月後 ${$DEADLINE[attrs.depositDate]}入金
                          `
                        }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon>mdi-clipboard-text-outline</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-subtitle
                        class="text-wrap"
                        style="line-height: 2"
                      >
                        {{ attrs.remarks }}
                      </v-list-item-subtitle>
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
