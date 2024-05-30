<template>
  <v-app :style="{ background: $vuetify.theme.themes.light.background }">
    <g-navigation-drawer v-model="drawer" app fixed bottom />
    <v-app-bar app color="primary" dark dense fixed flat>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title>Air Guard</v-toolbar-title>
      <v-spacer />
    </v-app-bar>
    <v-main>
      <!-- <Nuxt keep-alive :keep-alive-props="{ include: keepAlivePages }" /> -->
      <Nuxt />
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
      const result = ['CustomersIndex']
      // const result = []
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

.right-input input {
  text-align: right;
}
.g-card__title:before {
  content: '';
  position: absolute;
  left: 4px;
  /*bottom: -15px; /*線の上下位置*/
  display: inline-block;
  width: 5px; /*線の長さ*/
  height: 32px; /*線の太さ*/
  /* -webkit-transform: translateX(-50%);
  /* transform: translateX(-50%); /*位置調整*/
  background-color: #0d47a1; /*線の色*/
  border-radius: 2px; /*線の丸み*/
}

.g-card__title {
  display: block;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}
</style>
