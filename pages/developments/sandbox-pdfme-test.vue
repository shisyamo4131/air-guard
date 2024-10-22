<template>
  <div>
    <v-btn @click="generate">generate</v-btn>
  </div>
</template>

<script>
// import { BLANK_PDF } from '@pdfme/common'
// import { generate } from '@pdfme/generator'

export default {
  data() {
    return {
      inputs: [{ a: 'a1', b: 'b1', c: 'c1' }],
      template: {
        // basePdf: BLANK_PDF,
      },
      schemas: [
        [
          {
            name: 'a',
            type: 'text',
            position: { x: 0, y: 0 },
            width: 10,
            height: 10,
          },
          {
            name: 'b',
            type: 'text',
            position: { x: 10, y: 10 },
            width: 10,
            height: 10,
          },
          {
            name: 'c',
            type: 'text',
            position: { x: 20, y: 20 },
            width: 10,
            height: 10,
          },
        ],
      ],
    }
  },
  methods: {
    generate() {
      // generate({ template: this.template, inputs: this.inputs }).then((pdf) => {
      //   console.log(pdf)
      // })
    },
  },
}
</script>

<style></style>
