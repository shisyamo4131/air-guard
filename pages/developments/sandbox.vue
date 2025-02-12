<template>
  <v-container>
    <v-card>
      <v-card-title>sandbox</v-card-title>
      <v-container>
        <g-dialog-selector-customer>
          <template #activator="{ attrs, on }">
            <v-text-field v-bind="attrs" v-on="on" />
          </template>
        </g-dialog-selector-customer>
      </v-container>
    </v-card>
  </v-container>
</template>

<script>
import GDialogSelectorCustomer from '~/components/molecules/dialogs/GDialogSelectorCustomer.vue'
export default {
  components: { GDialogSelectorCustomer },
}
</script>

<style></style>
