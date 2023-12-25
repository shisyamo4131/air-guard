<script>
/**
 * ### GAutocompleteSite
 * @author shisyamo4131
 */
import GMaskedString from '../GMaskedString.vue'
import AAutocomplete from '~/components/atoms/inputs/AAutocomplete.vue'
export default {
  components: { AAutocomplete, GMaskedString },
  props: {
    autoSelectFirst: { type: Boolean, default: true, required: false },
    itemText: {
      type: [String, Array, Function],
      default: () => (item) => {
        return `${item.code || '------'}: ${item.name}`
      },
      required: false,
    },
    itemValue: {
      type: [String, Array, Function],
      default: 'docId',
      required: false,
    },
  },
  data() {
    return {
      search: null,
    }
  },
}
</script>

<template>
  <a-autocomplete
    v-bind="{ ...$props, ...$attrs }"
    :search-input.sync="search"
    v-on="$listeners"
  >
    <template #item="{ item, attrs, on }">
      <v-list-item v-bind="attrs" three-line v-on="on">
        <v-list-item-content>
          <v-list-item-title>
            <g-masked-string
              :value="`${item.code || '------'}: ${item.name}`"
              :search="search"
            />
          </v-list-item-title>
          <v-list-item-subtitle>{{ item.address }}</v-list-item-subtitle>
          <v-list-item-subtitle>{{
            $store.getters['masters/Customer'](item.customerId).abbr
          }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </template>
  </a-autocomplete>
</template>

<style></style>
