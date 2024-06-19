<script>
import GCardSubmitCancel from '~/components/molecules/cards/GCardSubmitCancel.vue'
import GInputSite from '~/components/molecules/inputs/GInputSite.vue'
import GSiteOperationScheduleCalendar from '~/components/organisms/GSiteOperationScheduleCalendar.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'SiteDetail',
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GInputSite, GCardSubmitCancel, GSiteOperationScheduleCalendar },
  /***************************************************************************
   * ASYNCDATA
   ***************************************************************************/
  asyncData({ app, route }) {
    const docId = route.params.docId
    const listeners = {
      site: app.$Site(),
    }
    listeners.site.subscribeDoc(docId)
    return { docId, listeners }
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dialog: {
        site: false,
      },
      editModel: {
        site: this.$Site(),
      },
      loading: {
        site: false,
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
        { text: '現場', to: '/sites', exact: true },
        { text: '現場詳細', to: `/sites/${this.docId}` },
      ]
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    'dialog.site'(v) {
      if (v) {
        this.editModel.site.initialize(this.listeners.site)
      } else {
        this.editModel.site.initialize()
      }
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
    async submitSite() {
      try {
        this.loading.site = true
        await this.editModel.site.update()
        this.dialog.site = false
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
    <v-container>
      <v-card class="mb-4" flat outlined>
        <v-card-title class="g-card__title">
          {{ listeners.site.name }}
          <v-chip
            v-if="listeners.site.status === 'expired'"
            color="red"
            label
            x-small
            outlined
          >
            {{ `${$SITE_STATUS[listeners.site.status]}` }}
          </v-chip>
        </v-card-title>
        <v-card-subtitle>
          {{ listeners.site.abbr }}
        </v-card-subtitle>
        <v-dialog v-model="dialog.site" max-width="600" persistent scrollable>
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
            :dialog.sync="dialog.site"
            label="現場"
            edit-mode="UPDATE"
            :loading="loading.site"
            @click:submit="submitSite"
          >
            <g-input-site
              v-bind.sync="editModel.site"
              edit-mode="UPDATE"
              hide-customer
            />
          </g-card-submit-cancel>
        </v-dialog>
      </v-card>
      <v-row>
        <v-col cols="12" md="5">
          <v-card flat outlined>
            <v-card-title class="g-card__title">
              <span>{{ listeners.site.address }}</span>
            </v-card-title>
            <v-card-text>
              <iframe
                :src="`https://maps.google.com/maps?output=embed&q=${listeners.site.address}&t=m&hl=ja&z=12`"
                width="100%"
                height="auto"
                frameborder="0"
                style="border: 0"
                allowfullscreen=""
              />
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="7">
          <g-site-operation-schedule-calendar :site-id="docId" height="612" />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style></style>
