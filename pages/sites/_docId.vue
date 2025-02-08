<script>
/**
 * 現場の詳細画面です。
 * @author shisyamo4131
 * @refact 2025-02-06
 */
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import GDocumentManagerSite from '~/components/managers/GDocumentManagerSite.vue'
import GBtnEdit from '~/components/atoms/btns/GBtnEdit.vue'
import GSiteOperationSchedulesManager from '~/components/organisms/GSiteOperationSchedulesManager.vue'
import GSiteContractsManager from '~/components/organisms/GSiteContractsManager.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'SiteDetail',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTemplateDefault,
    GDocumentManagerSite,
    GBtnEdit,
    GSiteOperationSchedulesManager,
    GSiteContractsManager,
  },

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
        { text: '現場', to: this.parentPath, exact: true },
        { text: '現場詳細', to: `${this.parentPath}/${this.docId}` },
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
        <!-- 現場概要 -->
        <v-col cols="12" lg="4">
          <g-document-manager-site :doc-id="docId">
            <template #default="{ attrs, on }">
              <v-card outlined>
                <v-card-title>{{ attrs.abbr }}</v-card-title>
                <v-card-subtitle>{{ attrs.abbrKana }}</v-card-subtitle>
                <v-list>
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon>mdi-code-tags</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ attrs.code }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon>mdi-fullscreen</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ attrs.name }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon>mdi-map-marker</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ attrs.address }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon>mdi-office-building</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ attrs.customer?.abbr || 'N/A' }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon>mdi-calendar</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ `${attrs.startAt} ～ ${attrs.endAt}` }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon>mdi-security</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ $SECURITY_TYPE[attrs.securityType] }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon>
                        {{
                          `mdi-${attrs.status === 'active' ? 'play' : 'stop'}`
                        }}
                      </v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ $SITE_STATUS[attrs.status] }}
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
          </g-document-manager-site>
        </v-col>

        <v-col cols="12" lg="8">
          <v-row>
            <!-- 稼働予定 -->
            <v-col cols="12">
              <v-card outlined>
                <v-container fluid class="pt-0">
                  <g-site-operation-schedules-manager :site-id="docId" />
                </v-container>
              </v-card>
            </v-col>
            <v-col cols="12">
              <v-card outlined>
                <v-container fluid>
                  <g-site-contracts-manager :site-id="docId" />
                </v-container>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </g-template-default>
</template>

<style></style>
