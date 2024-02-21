<template>
  <g-template-default label="MODELS">
    <v-container fluid>
      <a-select
        v-model="selectedItem"
        label="select model"
        :items="items"
        return-object
      />
      <v-row>
        <v-col cols="6">
          <v-card>
            <v-card-title>props</v-card-title>
            <v-card-text>
              <v-simple-table v-if="selectedItem">
                <thead>
                  <tr>
                    <th>prop</th>
                    <th>value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(prop, index) of Object.keys(selectedItem.model)"
                    :key="index"
                  >
                    <td>{{ prop }}</td>
                    <td>{{ selectedItem.model[prop] }}</td>
                  </tr>
                </tbody>
              </v-simple-table>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="6">
          <v-card>
            <v-card-title>input</v-card-title>
            <v-card-text v-if="selectedItem">
              <v-form v-model="valid">
                <component
                  :is="selectedItem.component"
                  v-bind.sync="selectedItem.model"
                />
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </g-template-default>
</template>

<script>
import ASelect from '~/components/atoms/inputs/ASelect.vue'
import GInputAutonumber from '~/components/molecules/inputs/GInputAutonumber.vue'
import GInputCustomer from '~/components/molecules/inputs/GInputCustomer.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
export default {
  components: {
    GTemplateDefault,
    ASelect,
    GInputAutonumber,
    GInputCustomer,
  },
  data() {
    return {
      items: [
        {
          text: 'Autonumber',
          model: this.$Autonumber(),
          component: 'g-input-autonumber',
        },
        {
          text: 'Customer',
          model: this.$Customer(),
          component: 'g-input-customer',
        },
      ],
      selectedItem: null,
      valid: false,
    }
  },
}
</script>

<style></style>
