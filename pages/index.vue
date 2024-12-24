<template>
  <g-template-default>
    <v-container class="pa-0 pa-md-3" fluid>
      <v-row :no-gutters="$vuetify.breakpoint.mobile">
        <v-col cols="12" md="4">
          <v-card
            color="teal"
            dark
            :tile="$vuetify.breakpoint.mobile"
            :flat="$vuetify.breakpoint.mobile"
          >
            <v-card-title>
              <v-icon left>mdi-table-account</v-icon>
              配置管理
            </v-card-title>
            <v-card-actions class="justify-end">
              <v-btn class="mr-2 mb-2" outlined rounded to="/placements"
                >管理画面</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col cols="12" md="4" class="d-flex">
          <g-digital-clock
            class="flex-grow-1"
            :tile="$vuetify.breakpoint.mobile"
            :flat="$vuetify.breakpoint.mobile"
          />
        </v-col>
        <v-col cols="6" md="4">
          <v-card
            v-if="hasPermission('/site-operation-schedules')"
            color="lime darken-2"
            dark
            :tile="$vuetify.breakpoint.mobile"
            :flat="$vuetify.breakpoint.mobile"
          >
            <v-card-title>
              <v-icon left>mdi-calendar-clock</v-icon>
              稼働予定
            </v-card-title>
            <v-card-actions class="justify-end">
              <v-btn
                class="mr-2 mb-2"
                outlined
                rounded
                to="/site-operation-schedules"
                >管理画面</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col cols="6" md="4">
          <v-card
            v-if="hasPermission('/employee-leave-applications')"
            color="amber darken-2"
            dark
            :tile="$vuetify.breakpoint.mobile"
            :flat="$vuetify.breakpoint.mobile"
          >
            <v-card-title>
              <v-icon left>mdi-beach</v-icon>
              休暇申請
            </v-card-title>
            <v-card-actions class="justify-end">
              <v-btn
                class="mr-2 mb-2"
                outlined
                rounded
                to="/employee-leave-applications"
                >管理画面</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col
          v-if="
            $store.getters['auth/isAdmin'] && nearingExpiredContracts.length > 0
          "
          cols="12"
        >
          <v-card
            :tile="$vuetify.breakpoint.mobile"
            :flat="$vuetify.breakpoint.mobile"
          >
            <v-card-text>
              <v-alert type="error" text class="mb-0 text-subtitle-2" dense>
                以下の従業員の雇用契約が間もなく満了となります。
              </v-alert>
              <v-list v-if="nearingExpiredContracts.length > 0">
                <v-list-item-group>
                  <!-- Vuex から従業員情報を取得できなかった場合にエラーになるのを回避 -->
                  <template
                    v-for="(contract, index) in nearingExpiredContracts"
                  >
                    <v-list-item
                      v-if="contract.employee"
                      :key="index"
                      :to="`employees/${contract.employee.docId}`"
                    >
                      <v-list-item-content>
                        <v-list-item-title>
                          {{ contract.employee.fullName }}
                        </v-list-item-title>
                        <v-list-item-subtitle>
                          契約満了日: {{ contract.expiredDate }}
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                  </template>
                  <!-- <v-list-item
                    v-for="(contract, index) in nearingExpiredContracts"
                    :key="index"
                    :to="`employees/${contract.employee.docId}`"
                  >
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ contract.employee.fullName }}
                      </v-list-item-title>
                      <v-list-item-subtitle>
                        契約満了日: {{ contract.expiredDate }}
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item> -->
                </v-list-item-group>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-alert class="my-0 my-md-4" type="info" text>
        少しずつ機能を追加しながら実装しています。メニューの色や配置は変更される可能性があります。
      </v-alert>
    </v-container>
  </g-template-default>
</template>

<script>
import pagePermissions from '~/assets/pagePermissions'
import GDigitalClock from '~/components/organisms/GDigitalClock.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'IndexPage',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GTemplateDefault, GDigitalClock },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {}
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    // Vuexのgettersを使って満了間近の契約情報を取得
    nearingExpiredContracts() {
      return this.$store.getters['employee-contracts/nearingExpired'].map(
        (contract) => {
          const employee = this.$store.getters['employees/get'](
            contract.employeeId
          )
          return {
            ...contract,
            employee,
          }
        }
      )
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * 引数で受け取った path が、user の role でアクセス可能かを判断します。
     */
    hasPermission(path) {
      if (!path) return false
      const userRoles = this.$store.getters['auth/roles']
      const requiredPermissions =
        pagePermissions[path.replace(/\//g, '-').slice(1)] || []
      if (!requiredPermissions.length) return true
      const isApproved =
        [...requiredPermissions, ...userRoles].filter(
          (item) =>
            requiredPermissions.includes(item) && userRoles.includes(item)
        ).length > 0
      return isApproved
    },
  },
}
</script>
