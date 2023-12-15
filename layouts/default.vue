<template>
  <v-app dark>
    <g-navigation-drawer v-model="drawer" app fixed />
    <v-app-bar app dense fixed>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title>AirGuard</v-toolbar-title>
      <v-spacer />
    </v-app-bar>
    <v-main>
      <v-container fluid>
        <Nuxt />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import GNavigationDrawer from '~/components/organisms/GNavigationDrawer.vue'
export default {
  name: 'DefaultLayout',
  components: { GNavigationDrawer },
  data() {
    return {
      drawer: false,
    }
  },
}
</script>

<style>
.firebase-emulator-warning {
  display: none;
}
</style>
