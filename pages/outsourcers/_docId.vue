<script>
import GInputOutsourcer from '~/components/molecules/inputs/GInputOutsourcer.vue'
import GCardSubmitCancel from '~/components/molecules/cards/GCardSubmitCancel.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'OutsourcerDetail',
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GInputOutsourcer,
    GCardSubmitCancel,
  },
  /***************************************************************************
   * ASYNCDATA
   ***************************************************************************/
  asyncData({ app, route }) {
    const docId = route.params.docId
    const listeners = {
      outsourcer: app.$Outsourcer(),
    }
    listeners.outsourcer.subscribeDoc(docId)
    return { docId, listeners }
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dialog: {
        outsourcer: false,
      },
      editModel: {
        outsourcer: this.$Outsourcer(),
      },
      loading: {
        outsourcer: false,
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
        { text: '外注先', to: '/outsourcers', exact: true },
        { text: '外注先詳細', to: `/outsourcers/${this.docId}` },
      ]
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    'dialog.outsourcer'(v) {
      if (v) {
        this.editModel.outsourcer.initialize(this.listeners.outsourcer)
      } else {
        this.editModel.outsourcer.initialize()
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
    async submitOutsourcer() {
      // if (!this.validateOutsourcer()) return
      try {
        this.loading.outsourcer = true
        await this.editModel.outsourcer.update()
        this.dialog.outsourcer = false
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        alert(err.message)
      } finally {
        this.loading.outsourcer = false
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
          {{ listeners.outsourcer.name }}
          <v-chip
            v-if="listeners.outsourcer.status === 'expired'"
            color="red"
            label
            x-small
            outlined
          >
            {{ `${$OUTSOURCER_STATUS[listeners.outsourcer.status]}` }}
          </v-chip>
        </v-card-title>
        <v-card-subtitle>
          {{ listeners.outsourcer.name2 }}
        </v-card-subtitle>
        <v-dialog
          v-model="dialog.outsourcer"
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
            :dialog.sync="dialog.outsourcer"
            label="外注先"
            edit-mode="UPDATE"
            :loading="loading.outsourcer"
            @click:submit="submitOutsourcer"
          >
            <g-input-outsourcer
              v-bind.sync="editModel.outsourcer"
              edit-mode="UPDATE"
            />
          </g-card-submit-cancel>
        </v-dialog>
      </v-card>
      <v-row>
        <v-col cols="12" md="5">
          <v-card flat outlined>
            <v-card-title class="g-card__title">
              <span>{{ listeners.outsourcer.address1 }}</span>
              <span v-if="listeners.outsourcer.address2" class="ml-2">
                {{ listeners.outsourcer.address2 }}
              </span>
            </v-card-title>
            <v-card-subtitle v-if="listeners.outsourcer.zipcode">
              {{ `〒${listeners.outsourcer.zipcode}` }}
            </v-card-subtitle>
            <v-card-text>
              <iframe
                :src="`https://maps.google.com/maps?output=embed&q=${listeners.outsourcer.address1}&t=m&hl=ja&z=12`"
                width="100%"
                height="auto"
                frameborder="0"
                style="border: 0"
                allowfullscreen=""
              />
              <div>
                <v-icon small left>mdi-phone</v-icon>
                {{ listeners.outsourcer.tel }}
              </div>
              <div>
                <v-icon small left>mdi-fax</v-icon>
                {{ listeners.outsourcer.fax }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="7"> </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style></style>
