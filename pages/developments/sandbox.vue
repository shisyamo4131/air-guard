<template>
  <v-container>
    <v-card>
      <v-card-title>sandbox</v-card-title>
      <v-card-text> </v-card-text>
      <v-card-actions>
        <v-btn @click="action">action</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import Employee from '~/models/Employee'
export default {
  methods: {
    async action() {
      const instance = new Employee()
      const docs = await instance.fetchDocs()
      for (const doc of docs) {
        if (!doc.bloodType) doc.bloodType = '-'
        await doc.update()
      }
    },
  },
}
</script>

<style></style>
