<template>
  <v-container>
    <v-card>
      <v-card-title>sandbox</v-card-title>
      <v-container>
        <v-row>
          <v-col>
            <g-card-floating-label-v-2
              color="primary"
              dark
              icon="mdi-magnify"
              label="FLOATING LABEL A+LKJSDF+LKJSDF+LKJSD+FLKJSD+FLKJSDF+LKJSD+FLKJSDF+LKJ"
              :menu-items="[
                { text: '追加', icon: 'mdi-plus', action: 'click:regist' },
                { text: '変更', icon: 'mdi-pencil', action: 'click:edit' },
              ]"
              outlined
              @click:regist="test"
            >
              <v-card-text
                >this is text.this is text.this is text.this is text.this is
                text.this is text.this is text.this is text.this is text.this is
                text.this is text.this is text.this is text.this is text.this is
                text.this is text.this is text.this is text.this is text.this is
                text.this is text.this is text.this is text.this is text.this is
                text.</v-card-text
              >
            </g-card-floating-label-v-2>
          </v-col>
          <v-col>
            <g-card-floating-label-v-2
              color="primary"
              dark
              icon="mdi-magnify"
              label="FLOATING LABEL"
            >
              <v-card-text
                >this is text.this is text.this is text.this is text.this is
                text.this is text.this is text.this is text.this is text.this is
                text.this is text.this is text.this is text.this is text.this is
                text.this is text.this is text.this is text.this is text.this is
                text.this is text.this is text.this is text.this is text.this is
                text.</v-card-text
              >
            </g-card-floating-label-v-2>
          </v-col>
        </v-row>
      </v-container>
      <v-card-actions>
        <v-btn @click="action">action</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import GCardFloatingLabelV2 from '~/components/atoms/cards/GCardFloatingLabelV2.vue'
import Employee from '~/models/Employee'
export default {
  components: { GCardFloatingLabelV2 },
  methods: {
    async action() {
      const instance = new Employee()
      const docs = await instance.fetchDocs()
      for (const doc of docs) {
        if (!doc.bloodType) doc.bloodType = '-'
        await doc.update()
      }
    },
    test() {
      console.log('OK')
    },
  },
}
</script>

<style></style>
