<template>
  <v-app dark>
    <g-navigation-drawer v-model="drawer" app fixed />
    <v-app-bar app dense fixed flat>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title>AirGuard</v-toolbar-title>
      <v-spacer />
    </v-app-bar>
    <v-main>
      <v-container fluid :class="containerClass">
        <Nuxt keep-alive :keep-alive-props="{ include: keepAlivePages }" />
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
  computed: {
    containerClass() {
      const result = {}
      if (this.$vuetify.breakpoint.smAndDown) {
        result['pa-0'] = true
      }
      return result
    },
    keepAlivePages() {
      // const result = [
      //   'IndexPage',
      //   'CustomersIndex',
      //   'SitesIndex',
      //   'EmployeesIndex',
      //   'OperationResultsIndex',
      // ]
      const result = []
      return result
    },
  },
}
</script>

<style>
.firebase-emulator-warning {
  display: none;
}

.center-input input {
  text-align: center;
}
</style>
