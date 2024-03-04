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
      // return []
      if (this.$route.path.includes('/customers')) {
        return ['CustomersIndex']
      } else if (this.$route.path.includes('/sites')) {
        return ['SitesIndex']
      } else if (this.$route.path.includes('/employees')) {
        return ['EmployeesIndex']
      } else if (this.$route.path.includes('/operation-results')) {
        return ['OperationResultsIndex']
      } else {
        return []
      }
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
