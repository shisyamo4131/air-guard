<template>
  <v-card v-bind="$attrs" v-on="$listeners">
    <v-card-title class="g-card__title"
      >{{ name1 }}
      <v-chip v-if="status === 'expired'" color="red" label x-small outlined>
        {{ `${$CUSTOMER_STATUS[status]}` }}
      </v-chip>
    </v-card-title>
    <v-card-subtitle>
      {{ name2 }}
    </v-card-subtitle>
    <v-card-text>
      <v-chip-group column>
        <v-chip color="blue" label small outlined>
          {{ `${$DEADLINE[deadline]}締め` }}
        </v-chip>
        <v-chip color="green" label small outlined>
          {{ `${depositMonth}ヶ月後 ${$DEADLINE[depositDate]}回収` }}
        </v-chip>
        <v-chip color="red" label small outlined
          ><v-icon x-small left>mdi-phone</v-icon>
          {{ `${tel}` }}
        </v-chip>
        <v-chip v-if="fax" color="brown" label small outlined
          ><v-icon x-small left>mdi-fax</v-icon>
          {{ `${fax}` }}
        </v-chip>
      </v-chip-group>
    </v-card-text>
    <g-dialog-editor-customer ref="customer-editor" label="取引先">
      <template #activator="{ attrs }">
        <v-btn
          v-bind="attrs"
          fab
          color="primary"
          top
          right
          absolute
          small
          @click="onClickEdit"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
      </template>
      <template #default="{ attrs, on }">
        <g-input-customer v-bind="attrs" v-on="on" />
      </template>
    </g-dialog-editor-customer>
  </v-card>
</template>

<script>
import GDialogEditorCustomer from '../molecules/dialogs/GDialogEditorCustomer.vue'
import GInputCustomer from '../molecules/inputs/GInputCustomer.vue'
import { props } from '~/models/Customer'
export default {
  components: { GDialogEditorCustomer, GInputCustomer },
  mixins: [props],
  methods: {
    onClickEdit() {
      this.$refs[`customer-editor`].open({
        item: this.$props,
        editMode: 'UPDATE',
      })
    },
  },
}
</script>

<style></style>
