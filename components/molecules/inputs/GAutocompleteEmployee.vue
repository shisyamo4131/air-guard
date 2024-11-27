<script>
/**
 * 従業員選択用のAutocompleteコンポーネントです。
 * @author shisyamo4131
 */
import GAutocomplete from '~/components/atoms/inputs/GAutocomplete.vue'
import GDialogEmployeeSelector from '~/components/molecules/dialogs/GDialogEmployeeSelector.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GDialogEmployeeSelector, GAutocomplete },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    itemText: { type: String, default: 'abbr', required: false },
    itemValue: { type: String, default: 'docId', required: false },
    multiple: { type: Boolean, default: false, required: false },
    label: { type: String, default: '従業員', required: false },
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    items() {
      return this.$store.getters['employees/items']
        .slice()
        .sort((a, b) => a.abbrKana.localeCompare(b.abbrKana))
    },
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    submit(event) {
      if (!Array.isArray(event)) {
        // eslint-disable-next-line
        console.warn('Expected an array for "event" parameter')
        return
      }

      const value = this.multiple
        ? event.map((item) => item?.[this.itemValue] ?? null)
        : event.length > 0
        ? event[0]?.[this.itemValue] ?? null
        : null

      this.$emit('input', value)
    },
  },
}
</script>

<template>
  <g-autocomplete
    v-bind="{ ...$props, ...$attrs }"
    :items="items"
    auto-select-first
    v-on="$listeners"
  >
    <template #append-outer>
      <g-dialog-employee-selector
        :items="items"
        :single-select="!multiple"
        @click:submit="submit"
      >
        <template #activator="{ attrs, on }">
          <v-icon v-bind="attrs" v-on="on">mdi-list-box-outline</v-icon>
        </template>
      </g-dialog-employee-selector>
    </template>
    <template #item="data">
      <v-list-item-content>
        <v-list-item-title>
          {{ data.item.fullName }}
        </v-list-item-title>
        <v-list-item-subtitle class="text-caption">
          {{ data.item.fullNameKana }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </template>
  </g-autocomplete>
</template>

<style></style>
