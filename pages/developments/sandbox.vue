<template>
  <v-container>
    <v-container>
      <v-card>
        <v-card-text>
          <v-text-field v-model="model.lastName" label="lastName" />
          <v-text-field v-model="model.firstName" label="firstName" />
        </v-card-text>
        <v-card-actions class="justify-space-between">
          <v-btn @click="create">create</v-btn>
          <v-btn @click="fetchDoc">fetchDoc</v-btn>
          <v-btn @click="update">update</v-btn>
          <v-btn @click="del">delete</v-btn>
          <v-btn @click="restore">restore</v-btn>
          <v-btn @click="subscribe">subscribe</v-btn>
          <v-btn @click="unsubscribe">unsubscribe</v-btn>
          <v-btn @click="subscribeDocs">subscribeDocs</v-btn>
        </v-card-actions>
      </v-card>
    </v-container>
    <v-container>
      <v-card>
        <v-card-title>DOCUMENTS</v-card-title>
        <v-data-table :items="items" :headers="headers">
          <template #[`item.actions`]="{ item }">
            <v-btn @click="fetch(item.docId)">fetch</v-btn>
          </template>
        </v-data-table>
      </v-card>
    </v-container>
    <v-container>
      <v-card>
        <v-card-title>ARCHIVES</v-card-title>
        <v-data-table :items="archives" :headers="headers">
          <template #[`item.actions`]="{ item }">
            <v-btn @click="restore(item.docId)">fetch</v-btn>
          </template>
        </v-data-table>
      </v-card>
    </v-container>
  </v-container>
</template>

<script>
import FireModel from 'air-firemodel'
class TestModel extends FireModel {
  constructor(item = {}) {
    super(item, 'TestCollection', [], true)
    Object.defineProperties(this, {
      fullName: {
        enumerable: true,
        get() {
          return `${this.lastName} ${this.firstName}`
        },
        set(v) {},
      },
    })
  }

  initialize(item = {}) {
    this.firstName = ''
    this.lastName = ''
    super.initialize(item)
  }
}
export default {
  components: {},
  data() {
    return {
      archives: [],
      docRef: null,
      items: [],
      model: new TestModel(),
    }
  },
  computed: {
    headers() {
      const result = Object.keys(this.model).map((key) => {
        return { text: key, value: key }
      })
      result.push({ text: 'actions', value: 'actions' })
      return result
    },
  },
  methods: {
    async create() {
      await this.model.create()
      this.model.initialize()
    },
    async fetch(docId) {
      await this.model.fetch(docId)
    },
    async fetchDoc() {
      const newModel = await this.model.fetchDoc(this.docRef.id)
      console.log(newModel)
    },
    async update() {
      this.model.firstName = 'daizo'
      this.model.lastName = 'maruyama'
      await this.model.update()
    },
    async del() {
      await this.model.delete()
    },
    async restore(docId) {
      await this.model.restore(docId)
    },
    subscribe() {
      this.model.subscribe(this.docRef.id)
    },
    unsubscribe() {
      this.model.unsubscribe()
    },
    subscribeDocs() {
      this.items = this.model.subscribeDocs()
    },
  },
}
</script>

<style></style>
