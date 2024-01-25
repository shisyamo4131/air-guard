<template>
  <div>
    <g-autocomplete-customer v-model="selectedItem" required />
    {{ selectedItem }}
  </div>
</template>

<script>
import GAutocompleteCustomer from '~/components/molecules/inputs/GAutocompleteCustomer.vue'
export default {
  components: { GAutocompleteCustomer },
  data() {
    return {
      model: this.$Customer(),
      selectedItem: null,
      // selectedItem: ['cCKqxYVGLOWkTJViCar7'],
      // selectedItem: {
      //   updateDate: '2024/1/23 17:44:40',
      //   code: '0001',
      //   abbrKana: 'ユイシン',
      //   address: '東京都',
      //   docId: 'cCKqxYVGLOWkTJViCar7',
      //   updateAt: 1705967080309,
      //   createAt: 1705966315317,
      //   uid: 'srL4DVJr71llSXTwW1wcaVXePi5u',
      //   tokenMap: {
      //     式会: true,
      //     心: true,
      //     イ: true,
      //     ユ: true,
      //     株式: true,
      //     株: true,
      //     会社: true,
      //     式: true,
      //     唯: true,
      //     ン: true,
      //     イシ: true,
      //     シ: true,
      //     ユイ: true,
      //     会: true,
      //     シン: true,
      //     社: true,
      //     社唯: true,
      //     唯心: true,
      //   },
      //   name2: '',
      //   abbr: '唯心',
      //   name1: '株式会社唯心',
      //   favorite: false,
      //   createDate: '2024/1/23 17:31:55',
      //   status: 'active',
      // },
    }
  },
}
</script>

<style></style>
