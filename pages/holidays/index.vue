<script>
/**
 * 祝日情報の管理画面です。
 * @author shisyamo4131
 * @refact 2025-01-20
 */
import { database } from 'air-firebase'
import { onValue, ref } from 'firebase/database'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import GCalendarV2 from '~/components/atoms/calendars/GCalendarV2.vue'
import GBtnPrev from '~/components/atoms/btns/GBtnPrev.vue'
import GBtnNext from '~/components/atoms/btns/GBtnNext.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'HolidaysIndex',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GTemplateDefault, GCalendarV2, GBtnPrev, GBtnNext },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      data: null,
      date: this.$dayjs().format('YYYY-MM-DD'),
      listener: null,
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    events() {
      if (!this.data) return []
      return Object.values(this.data).map(({ date, name }) => {
        return {
          start: date,
          name,
          color: 'red lighten-2',
        }
      })
    },
    month() {
      return this.date.slice(0, 7)
    },
    year() {
      return this.date.slice(0, 4)
    },
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    month: {
      handler() {
        this.subscribe()
      },
      immediate: true,
    },
  },

  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.unsubscribe()
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * 基準日（date）を翌月月初にします。
     */
    next() {
      this.date = this.$dayjs(this.date)
        .startOf('month')
        .add(1, 'month')
        .format('YYYY-MM-DD')
    },

    /**
     * 基準日（date）を前月月初に設定します。
     */
    prev() {
      this.date = this.$dayjs(this.date)
        .startOf('month')
        .subtract(1, 'month')
        .format('YYYY-MM-DD')
    },

    /**
     * 祝日データの購読を開始します。
     */
    subscribe() {
      const dbRef = ref(database, `Holidays/${this.year}/${this.month}`)
      this.listener = onValue(dbRef, (snapshot) => {
        this.data = snapshot.val()
      })
    },

    /**
     * 祝日データを更新します。
     */
    async refresh() {
      await this.$holiday.fetchAndSaveHolidays(this.year)
    },

    /**
     * 祝日データの購読を解除します。
     */
    unsubscribe() {
      if (this.listener) this.listener()
    },
  },
}
</script>

<template>
  <g-template-default v-slot="{ height }">
    <v-container class="pa-0 pa-md-3" :style="{ height: `${height}px` }">
      <v-card
        flat
        height="100%"
        class="d-flex flex-column"
        :tile="$vuetify.breakpoint.mobile"
      >
        <v-toolbar class="flex-grow-0" color="primary" dark dense flat>
          <v-icon left>mdi-flag</v-icon>
          <v-toolbar-title>祝日設定</v-toolbar-title>
          <v-spacer />
          <v-toolbar-items>
            <v-btn text @click="refresh">更新</v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-toolbar class="flex-grow-0" flat>
          <v-spacer />
          <g-btn-prev color="primary" icon @click="prev" />
          <span class="text-h6">{{ month }}</span>
          <g-btn-next color="primary" icon @click="next" />
          <v-spacer />
        </v-toolbar>
        <v-card-text class="pa-0 pa-md-4 pt-0 flex-grow-1">
          <g-calendar-v-2 v-model="date" :events="events" />
        </v-card-text>
      </v-card>
    </v-container>
  </g-template-default>
</template>

<style></style>
