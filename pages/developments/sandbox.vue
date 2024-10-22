<template>
  <v-container>
    <v-card>
      <v-btn @click="generatePdf">generate</v-btn>
    </v-card>
  </v-container>
</template>

<script>
export default {
  methods: {
    async generatePdf() {
      const content = [
        {
          text: 'Hello, this is a PDF generated with pdfmake!',
          fontSize: 16,
        },
        { text: 'Nuxt.jsを使っています', fontSize: 12 },
      ]
      await this.$generatePdf({ content })
    },
  },
}
</script>

<style scoped></style>
