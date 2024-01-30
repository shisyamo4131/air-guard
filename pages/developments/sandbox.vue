<template>
  <g-template-default>
    <v-container>
      <a-renderless-zipcode @loaded="address = $event.full">
        <template #default="{ attrs, on }">
          <v-text-field v-model="zipcode" v-bind="attrs" v-on="on" />
        </template>
      </a-renderless-zipcode>
      <v-text-field v-model="address" />
    </v-container>
  </g-template-default>
</template>

<script>
import ARenderlessZipcode from '~/components/atoms/renderless/ARenderlessZipcode.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
export default {
  components: { GTemplateDefault, ARenderlessZipcode },
  data() {
    return {
      zipcode: null,
      address: null,
    }
  },
  methods: {
    test(event) {
      console.log(event)
    },
  },
}
</script>

<style></style>
