<script>
/**
 * 現場取極め管理コンポーネント
 *
 * @author shisyamo4131
 * @refact 2025-02-08
 */
import dayjs from 'dayjs'
import GCollectionManagerSiteContracts from '../managers/GCollectionManagerSiteContracts.vue'
import GBtnRegist from '../atoms/btns/GBtnRegist.vue'
import GBtnEdit from '../atoms/btns/GBtnEdit.vue'
import SiteContract from '~/models/SiteContract'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GCollectionManagerSiteContracts, GBtnRegist, GBtnEdit },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * 管理対象の現場IDです。
     */
    siteId: { type: String, required: true },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      instance: new SiteContract(),
      items: [],
      window: 0,
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    computedItems() {
      return this.items.slice().sort((a, b) => {
        // まず startDate を降順（新しいものを上に）
        if (a.startDate !== b.startDate) {
          return a.startDate < b.startDate ? 1 : -1
        }
        // startDate が同じ場合は workShift を昇順（小さいものを上に）
        return a.workShift < b.workShift ? -1 : 1
      })
    },
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    siteId: {
      handler(v) {
        if (!v) return
        this.instance.siteId = v
        this.subscribe()
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
    formatDate(value) {
      return dayjs(value).format('YYYY年MM月DD日')
    },
    formatPrice(value) {
      return value != null ? value.toLocaleString() : '-'
    },
    next() {
      this.window = this.window + 1 === this.length ? 0 : this.window + 1
    },
    prev() {
      this.window = this.window - 1 < 0 ? this.length - 1 : this.window - 1
    },
    subscribe() {
      this.items = this.instance.subscribeDocs([
        ['where', 'siteId', '==', this.siteId],
      ])
    },
  },
}
</script>

<template>
  <g-collection-manager-site-contracts
    :items="computedItems"
    :instance="instance"
  >
    <template #default="defaultProps">
      <v-card flat tile>
        <v-window v-model="window">
          <v-window-item
            v-for="(item, index) of defaultProps.items"
            :key="index"
          >
            <v-card outlined>
              <v-toolbar flat>
                <v-toolbar-title>
                  {{ `${formatDate(item.startDate)} ～` }}
                </v-toolbar-title>
                <v-spacer />
                <g-btn-regist
                  icon
                  color="primary"
                  @click="defaultProps.toRegist"
                />
                <g-btn-edit
                  icon
                  color="primary"
                  @click="defaultProps.toUpdate(item)"
                />
              </v-toolbar>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ `${$WORK_SHIFT[item.workShift]}` }}
                    {{
                      `${item.startTime} ～ ${item.endTime} (${item.breakMinutes})`
                    }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-simple-table>
                <tbody>
                  <tr>
                    <td></td>
                    <td>基本</td>
                    <td>資格者</td>
                  </tr>
                  <tr
                    v-for="(label, key) in {
                      weekdays: '平日',
                      saturday: '土曜',
                      sunday: '日曜',
                      holiday: '祝日',
                    }"
                    :key="key"
                  >
                    <td>{{ label }}</td>
                    <td>
                      <div>
                        {{
                          formatPrice(item.unitPrices?.[key]?.standard?.price)
                        }}
                      </div>
                      <div>
                        ({{
                          formatPrice(
                            item.unitPrices?.[key]?.standard?.overtime
                          )
                        }})
                      </div>
                    </td>
                    <td>
                      <div>
                        {{
                          formatPrice(item.unitPrices?.[key]?.qualified?.price)
                        }}
                      </div>
                      <div>
                        ({{
                          formatPrice(
                            item.unitPrices?.[key]?.qualified?.overtime
                          )
                        }})
                      </div>
                    </td>
                  </tr>
                </tbody>
              </v-simple-table>
            </v-card>
          </v-window-item>
        </v-window>
        <v-card-actions class="justify-space-between">
          <v-btn text @click="prev">
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <v-item-group v-model="window" class="text-center" mandatory>
            <v-item
              v-for="n in defaultProps.items.length"
              :key="`btn-${n}`"
              v-slot="{ active, toggle }"
            >
              <v-btn :input-value="active" icon @click="toggle">
                <v-icon>mdi-record</v-icon>
              </v-btn>
            </v-item>
          </v-item-group>
          <v-btn text @click="next">
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </g-collection-manager-site-contracts>
</template>

<style></style>
