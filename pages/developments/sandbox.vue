<template>
  <g-template-default>
    <v-container>
      <v-card>
        <v-card-text>
          <v-text-field v-model="from" label="from" />
          <v-text-field v-model="to" label="to" />
        </v-card-text>
        <v-card-actions>
          <g-btn-submit @click="test" />
          <v-btn @click="exchange">入れ替え</v-btn>
        </v-card-actions>
      </v-card>
    </v-container>
  </g-template-default>
</template>

<script>
import GBtnSubmit from '~/components/atoms/btns/GBtnSubmit.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import SiteOperationSchedule from '~/models/SiteOperationSchedule'
export default {
  components: { GTemplateDefault, GBtnSubmit },
  data() {
    return {
      from: 'JG6xWV91tIf1PMwl5LXX',
      to: 'lp5VsTLMfKuN7dWR5DMo',
    }
  },
  methods: {
    async test() {
      await SiteOperationSchedule.integrate({ from: this.from, to: this.to })
    },
    exchange() {
      const buff = this.to
      this.to = this.from
      this.from = buff
    },
  },
}
</script>

<style></style>
