<template>
  <v-container>
    <v-card>
      <v-card-actions>
        <v-btn @click="add">add</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import NewUser from '~/models/NewUser'
export default {
  data() {
    return {
      instance: new NewUser({
        email: 'm-kaneko@yuisin.net',
        password: 'Masaki1727',
        employeeId: '3uSx9gHKct62myKFx4yo',
        displayName: '金子真樹',
      }),
    }
  },
  methods: {
    async add() {
      await this.instance.create()
    },
  },
}
</script>

<style></style>
