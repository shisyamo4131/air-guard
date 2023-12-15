<template>
  <v-navigation-drawer
    v-bind="$attrs"
    app
    disable-resize-watcher
    v-on="$listeners"
  >
    <v-list nav dense>
      <template v-for="(nav_list, index) of menuList">
        <v-list-group
          v-if="nav_list.lists.length"
          :key="`group-${index}`"
          :prepend-icon="nav_list.icon"
          no-action
        >
          <template #activator>
            <v-list-item-content>
              <v-list-item-title>{{ nav_list.name }}</v-list-item-title>
            </v-list-item-content>
          </template>
          <v-list-item
            v-for="(list, listIndex) in nav_list.lists"
            :key="listIndex"
            :to="list.to"
          >
            <v-list-item-content>
              <v-list-item-title>{{ list.name }}</v-list-item-title>
            </v-list-item-content>
            <v-list-item-icon>
              <v-icon>{{ list.icon }}</v-icon>
            </v-list-item-icon>
          </v-list-item>
        </v-list-group>
        <v-list-item v-else :key="`item-${index}`" :to="nav_list.to">
          <v-list-item-icon>
            <v-icon>{{ nav_list.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ nav_list.name }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </template>
      <v-list-item @click="logout">
        <v-list-item-icon>
          <v-icon>mdi-logout</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>ログアウト</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-subtitle>
            <!-- version: {{ $store.state.version }} -->
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import AllNavLists from '~/assets/nav_lists.json'
import pagePermissions from '~/assets/pagePermissions'
export default {
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      allNavLists: AllNavLists,
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    menuList() {
      // トップレベルのtoプロパティを基準に絞り込み
      const topFilteredLists = this.allNavLists.filter((list) => {
        if ('to' in list) {
          return this.hasPermission(list)
        } else {
          return true
        }
      })
      // 入れ子部分のtoプロパティを基準に絞り込み
      const secondFilteredLists = topFilteredLists.map((navList) => {
        const allowedLists = navList.lists.filter((list) => {
          return this.hasPermission(list)
        })
        const result = { ...navList, lists: allowedLists }
        return result
      })
      // 絞り込んだ結果、toプロパティがなく、lists配列が0のものを除外
      const result = secondFilteredLists.filter((list) => {
        if ('to' in list) return true
        return list.lists.length !== 0
      })
      return result
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * 引数で受け取ったlistが、userのroleでアクセス可能なtoを持っているかを判断します。
     * listがtoプロパティを持っていなければ無条件にtrueを返します。
     * pagePermissionsを参照し、toプロパティが指定するディレクトリへの
     * 権限設定がない場合は無条件にtrueを返します。
     */
    hasPermission(list) {
      if (!('to' in list)) return true
      const userRoles = this.$store.getters['auth/roles']
      const requiredPermissions =
        pagePermissions[list.to.replace(/\//g, '-').slice(1)] || []
      if (!requiredPermissions.length) return true
      const isApproved =
        [...requiredPermissions, ...userRoles].filter(
          (item) =>
            requiredPermissions.includes(item) && userRoles.includes(item)
        ).length > 0
      return isApproved
    },
    async logout() {
      try {
        await this.$store.dispatch('auth/signOut')
        this.$router.push({ name: 'login' })
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        alert(err.message)
      }
    },
  },
}
</script>

<style></style>
