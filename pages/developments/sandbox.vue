<template>
  <g-template-default>
    <v-container>
      <a-select
        v-model="selectedComponent"
        label="select component"
        :items="components"
      />
      <component
        :is="selectedComponent"
        v-model="params.value"
        :collection-id="params.collectionId"
        :lazy-value.sync="params.lazyValue"
      />
      <v-container>
        <v-simple-table>
          <tbody>
            <tr v-for="(param, index) of Object.keys(params)" :key="index">
              <td>{{ param }}</td>
              <td>{{ params[param] }}</td>
            </tr>
          </tbody>
        </v-simple-table>
      </v-container>
      <v-card>
        <v-card-title>FireModel</v-card-title>
        <v-card-actions class="justify-space-between">
          <v-btn @click="subscribe">subscribe</v-btn>
          <v-btn @click="unsubscribe">unsubscribe</v-btn>
        </v-card-actions>
      </v-card>
    </v-container>
  </g-template-default>
</template>

<script>
import ASelect from '~/components/atoms/inputs/ASelect.vue'
import GTextFieldSearch from '~/components/molecules/inputs/GTextFieldSearch.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
export default {
  components: {
    GTextFieldSearch,
    GTemplateDefault,
    ASelect,
  },
  data() {
    return {
      components: [{ text: 'GTextFieldSearch', value: 'g-text-field-search' }],
      params: {
        collectionId: 'Customers',
        items: [],
        lazyValue: null,
        value: null,
      },
      selectedComponent: null,
      model: this.$Customer(),
    }
  },
  methods: {
    subscribe() {
      this.params.items = this.model.subscribe('ユイシン')
    },
    unsubscribe() {
      this.model.unsubscribe()
    },
  },
}
</script>

<style></style>
