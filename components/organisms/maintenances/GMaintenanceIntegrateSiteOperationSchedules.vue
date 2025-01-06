<script>
/**
 * 現場の稼働予定ドキュメントを統合します。
 *
 * 誤って登録してしまった現場の現場稼働予定ドキュメントを本来登録すべき現場の稼働予定ドキュメントとして移行します。
 * 配置データは統合されないため注意してください。
 *
 * @author shisyamo4131
 */
import GAlertError from '~/components/atoms/alerts/GAlertError.vue'
import GBtnSubmit from '~/components/atoms/btns/GBtnSubmit.vue'
import GAutocompleteSite from '~/components/atoms/inputs/GAutocompleteSite.vue'
import GCalendarSiteOperationSchedules from '~/components/molecules/calendars/GCalendarSiteOperationSchedules.vue'
import SiteOperationSchedule from '~/models/SiteOperationSchedule'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GBtnSubmit,
    GAutocompleteSite,
    GCalendarSiteOperationSchedules,
    GAlertError,
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      err: {},
      formValid: false,
      from: null,
      loading: false,
      schedules: {
        from: [],
        to: [],
      },
      snackbar: true,
      to: null,
    }
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    from: {
      async handler(v) {
        this.schedules.from = await this.fetchSchedules(v)
      },
    },
    to: {
      async handler(v) {
        this.schedules.to = await this.fetchSchedules(v)
      },
    },
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * 統合処理を実行します。
     */
    async submit() {
      this.loading = true
      try {
        await SiteOperationSchedule.integrate({ from: this.from, to: this.to })
        ;[this.schedules.from, this.schedules.to] = await Promise.all([
          this.fetchSchedules(this.from),
          this.fetchSchedules(this.to),
        ])
      } catch (err) {
        this.err = err
      } finally {
        this.loading = false
      }
    },

    /**
     * 指定された現場IDの稼働予定ドキュメントをすべて取得します。
     */
    async fetchSchedules(siteId) {
      if (!siteId) return []
      this.loading = true
      try {
        const instance = new SiteOperationSchedule()
        return await instance.fetchDocs([['where', 'siteId', '==', siteId]])
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err.message)
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<template>
  <v-card>
    <v-card-title> 現場稼働予定統合 </v-card-title>
    <v-card-text>
      2つの現場の稼働予定を統合します。統合先に同一日、同一勤務区分の稼働予定が存在した場合は上書きされます。
    </v-card-text>
    <v-form v-model="formValid">
      <v-container fluid>
        <v-row>
          <v-col cols="12" md="6">
            <g-autocomplete-site v-model="from" label="統合元" required />
            <g-calendar-site-operation-schedules :items="schedules.from" />
          </v-col>
          <v-col cols="12" md="6">
            <g-autocomplete-site v-model="to" label="統合先" required />
            <g-calendar-site-operation-schedules :items="schedules.to" />
          </v-col>
        </v-row>
      </v-container>
    </v-form>
    <v-expand-transition>
      <v-container v-show="err.message" fluid>
        <g-alert-error v-model="err" />
      </v-container>
    </v-expand-transition>
    <v-card-actions class="justify-end">
      <g-btn-submit
        color="primary"
        :disabled="!formValid || loading"
        :loading="loading"
        @click="submit"
      />
    </v-card-actions>
  </v-card>
</template>

<style></style>
