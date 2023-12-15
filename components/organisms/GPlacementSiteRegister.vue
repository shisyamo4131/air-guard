<template>
  <v-dialog v-model="dialog" max-width="720">
    <template #activator="props">
      <slot name="activator" v-bind="props" />
    </template>
    <v-card>
      <v-toolbar dark dense flat color="primary">
        <v-toolbar-title>現場追加</v-toolbar-title>
      </v-toolbar>
      <v-toolbar flat>
        <a-text-field-search v-model="search" />
      </v-toolbar>
      <v-card-text>
        <v-data-table
          v-model="selectedItem"
          fixed-header
          :items="search ? sites : []"
          item-key="docId"
          :headers="headers"
          :height="$vuetify.breakpoint.height * 0.4"
          :search="search"
          show-select
          single-select
        />
        <v-radio-group v-model="workShift" mandatory row>
          <v-radio label="日勤" value="day" />
          <v-radio label="夜勤" value="night" />
        </v-radio-group>
      </v-card-text>
      <v-card-actions class="justify-space-between">
        <v-btn @click="dialog = false">cancel</v-btn>
        <v-btn
          color="primary"
          :disabled="!selectedItem.length"
          @click="onClickSubmit"
          >submit</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import ATextFieldSearch from '../atoms/inputs/ATextFieldSearch.vue'
export default {
  components: { ATextFieldSearch },
  data() {
    return {
      dialog: false,
      headers: [
        { text: 'CODE', value: 'code' },
        { text: '現場名', value: 'name' },
        { text: '住所', value: 'address' },
      ],
      selectedItem: [],
      search: null,
      workShift: 'day',
    }
  },
  computed: {
    sites() {
      return this.$store.getters['masters/Sites']
    },
  },
  watch: {
    dialog(v) {
      if (v) return
      this.selectedItem.splice(0)
      this.workShift = 'day'
    },
  },
  methods: {
    async onClickSubmit() {
      try {
        const [siteId, workShift] = [this.selectedItem[0].docId, this.workShift]
        await this.$store.dispatch('placements/addIndex', { siteId, workShift })
        this.dialog = false
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        alert(err.message)
      }
    },
  },
}
</script>

<style></style>
