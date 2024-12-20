<template>
  <v-container>
    <v-card>
      <v-card-text> </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import Employee from '~/models/Employee'
export default {
  components: {},
  data() {
    return {
      instance: new Employee(),
    }
  },
}
</script>
