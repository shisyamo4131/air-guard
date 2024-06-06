<script>
import { where } from 'firebase/firestore'
import GDataTable from '~/components/atoms/tables/GDataTable.vue'
import GInputCustomer from '~/components/molecules/inputs/GInputCustomer.vue'
import GTextFieldSearch from '~/components/molecules/inputs/GTextFieldSearch.vue'
import GBtnRegistIcon from '~/components/molecules/btns/GBtnRegistIcon.vue'
import GInputSite from '~/components/molecules/inputs/GInputSite.vue'
import GIconFavoriteSite from '~/components/molecules/icons/GIconFavoriteSite.vue'
import GCardSubmitCancel from '~/components/molecules/cards/GCardSubmitCancel.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'CustomerDetail',
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GDataTable,
    GInputCustomer,
    GTextFieldSearch,
    GBtnRegistIcon,
    GInputSite,
    GIconFavoriteSite,
    GCardSubmitCancel,
  },
  /***************************************************************************
   * ASYNCDATA
   ***************************************************************************/
  asyncData({ app, route }) {
    const docId = route.params.docId
    const listeners = {
      customer: app.$Customer(),
      site: app.$Site(),
    }
    listeners.customer.subscribeDoc(docId)
    return { docId, listeners }
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dialog: {
        customer: false,
        site: false,
      },
      editModel: {
        customer: this.$Customer(),
        site: this.$Site(),
      },
      items: {
        sites: [],
      },
      lazySearch: {
        sites: null,
      },
      loading: {
        customer: false,
        site: false,
        sites: false,
      },
      page: {
        sites: 1,
      },
      pageCount: {
        sites: 0,
      },
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    breadcrumbs() {
      return [
        { text: 'TOP', to: '/' },
        { text: '取引先', to: '/customers', exact: true },
        { text: '取引先詳細', to: `/customers/${this.docId}` },
      ]
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    'dialog.customer'(v) {
      if (v) {
        this.editModel.customer.initialize(this.listeners.customer)
      } else {
        this.editModel.customer.initialize()
      }
    },
    'dialog.site'(v) {
      if (v) {
        this.editModel.site.initialize({ customerId: this.docId })
      } else {
        this.editModel.site.initialize({ customerId: this.docId })
      }
    },
    'lazySearch.sites': {
      handler(newVal, oldVal) {
        if (newVal === oldVal) return
        this.fetchSites()
      },
      immediate: true,
    },
  },
  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    Object.keys(this.listeners).forEach((key) => {
      this.listeners[key].unsubscribe()
    })
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    toggledFavoriteSite(item) {
      item.favorite = !item.favorite
    },
    async fetchSites() {
      this.items.sites.splice(0)
      this.loading.sites = true
      try {
        const ngram = this.lazySearch.sites || undefined
        const constraints = this.lazySearch.sites
          ? [where('customerId', '==', this.docId)]
          : [
              where('customerId', '==', this.docId),
              where('favorite', '==', true),
            ]
        this.items.sites = await this.listeners.site.fetchDocs(
          ngram,
          constraints
        )
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        alert(err.message)
      } finally {
        this.loading.sites = false
      }
    },
    async submitCustomer() {
      // if (!this.validateCustomer()) return
      try {
        this.loading.customer = true
        await this.editModel.customer.update()
        this.dialog.customer = false
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        alert(err.message)
      } finally {
        this.loading.customer = false
      }
    },
    async submitSite() {
      // if (!this.validateSite()) return
      try {
        this.loading.site = true
        const docRef = await this.editModel.site.create()
        this.dialog.site = false
        this.$router.push(`/sites/${docRef.id}`)
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        alert(err.message)
      } finally {
        this.loading.site = false
      }
    },
  },
}
</script>

<template>
  <div>
    <v-breadcrumbs :items="breadcrumbs" />
    <v-container fluid>
      <v-card class="mb-4" flat outlined>
        <v-card-title class="g-card__title">
          {{ listeners.customer.name1 }}
          <v-chip
            v-if="listeners.customer.status === 'expired'"
            color="red"
            label
            x-small
            outlined
          >
            {{ `${$CUSTOMER_STATUS[listeners.customer.status]}` }}
          </v-chip>
        </v-card-title>
        <v-card-subtitle>
          {{ listeners.customer.name2 }}
        </v-card-subtitle>
        <v-card-text>
          <v-chip-group column>
            <v-chip color="blue" label small outlined>
              {{ `${$DEADLINE[listeners.customer.deadline]}締め` }}
            </v-chip>
            <v-chip color="green" label small outlined>
              {{
                `${listeners.customer.depositMonth}ヶ月後 ${
                  $DEADLINE[listeners.customer.depositDate]
                }回収`
              }}
            </v-chip>
          </v-chip-group>
        </v-card-text>
        <v-dialog
          v-model="dialog.customer"
          max-width="600"
          persistent
          scrollable
        >
          <template #activator="{ attrs, on }">
            <v-btn
              v-bind="attrs"
              fab
              color="primary"
              top
              right
              absolute
              small
              v-on="on"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </template>
          <g-card-submit-cancel
            :dialog.sync="dialog.customer"
            label="取引先"
            edit-mode="UPDATE"
            :loading="loading.customer"
            @click:submit="submitCustomer"
          >
            <g-input-customer
              v-bind.sync="editModel.customer"
              edit-mode="UPDATE"
            />
          </g-card-submit-cancel>
        </v-dialog>
      </v-card>
      <v-row>
        <v-col cols="12" md="5">
          <v-card flat outlined>
            <v-card-title class="g-card__title">
              <span>{{ listeners.customer.address1 }}</span>
              <span v-if="listeners.customer.address2" class="ml-2">
                {{ listeners.customer.address2 }}
              </span>
            </v-card-title>
            <v-card-subtitle v-if="listeners.customer.zipcode">
              {{ `〒${listeners.customer.zipcode}` }}
            </v-card-subtitle>
            <v-card-text>
              <iframe
                :src="`https://maps.google.com/maps?output=embed&q=${listeners.customer.address1}&t=m&hl=ja&z=12`"
                width="100%"
                height="auto"
                frameborder="0"
                style="border: 0"
                allowfullscreen=""
              />
              <div>
                <v-icon small left>mdi-phone</v-icon>
                {{ listeners.customer.tel }}
              </div>
              <div>
                <v-icon small left>mdi-fax</v-icon>
                {{ listeners.customer.fax }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="7">
          <v-card flat outlined>
            <v-card-title class="g-card__title"> 現場 </v-card-title>
            <v-toolbar dense flat>
              <g-text-field-search :lazy-value.sync="lazySearch.sites" />
              <v-dialog
                v-model="dialog.site"
                max-width="600"
                persistent
                scrollable
              >
                <template #activator="{ attrs, on }">
                  <g-btn-regist-icon v-bind="attrs" color="primary" v-on="on" />
                </template>
                <g-card-submit-cancel
                  :dialog.sync="dialog.site"
                  label="現場"
                  edit-mode="REGIST"
                  :loading="loading.site"
                  @click:submit="submitSite"
                >
                  <g-input-site
                    v-bind.sync="editModel.site"
                    edit-mode="REGIST"
                    hide-customer
                  />
                </g-card-submit-cancel>
              </v-dialog>
            </v-toolbar>
            <g-data-table
              :actions="['detail']"
              :headers="[
                { text: 'CODE', value: 'code', width: 84 },
                {
                  text: 'お気に入り',
                  value: 'favorite',
                  width: 96,
                  sortable: false,
                  align: 'center',
                },
                { text: '現場名', value: 'name' },
              ]"
              :items="items.sites"
              :loading="loading.sites"
              :no-data-text="
                lazySearch
                  ? '該当する現場が登録されていません。'
                  : 'お気に入りに登録されている現場がありません。'
              "
              :page="page.sites"
              sort-by="code"
              sort-desc
              @page-count="pageCount.sites = $event"
              @click:detail="$router.push(`/sites/${$event.docId}`)"
            >
              <template #[`item.favorite`]="{ item }">
                <g-icon-favorite-site
                  :item="item"
                  left
                  small
                  @toggled="toggledFavoriteSite(item)"
                />
              </template>
              <template #[`item.name`]="{ item }">
                {{ item.name }}
                <v-chip v-if="item.status === 'expired'" x-small>終了</v-chip>
                <div class="text-caption grey--text text--darken-1">
                  {{ item.address }}
                </div>
              </template>
            </g-data-table>
            <v-container>
              <v-pagination v-model="page.sites" :length="pageCount.sites" />
            </v-container>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style></style>
