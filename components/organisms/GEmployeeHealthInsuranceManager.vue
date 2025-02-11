<script>
import GCollectionManager from '../managers/GCollectionManager.vue'
import GInputHealthInsurance from '../molecules/inputs/GInputHealthInsurance.vue'
import GCardHealthInsurance from '../molecules/cards/GCardHealthInsurance.vue'
import GCardFloatingLabelV2 from '../atoms/cards/GCardFloatingLabelV2.vue'
import HealthInsurance from '~/models/HealthInsurance'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GCollectionManager,
    GInputHealthInsurance,
    GCardHealthInsurance,
    GCardFloatingLabelV2,
  },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    color: { type: String, default: 'primary', required: false },
    employeeId: { type: String, required: true },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      instance: new HealthInsurance(),
      items: [],
      window: 0,
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    computedItems() {
      return this.items.slice().sort((a, b) => {
        return a.acquisitionDate < b.acquisitionDate ? 1 : -1
      })
    },
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    /**
     * props.employeId を監視し、与えられた従業員IDにもとづいて
     * 健康保険ドキュメントの購読を開始します。
     */
    employeeId: {
      handler(v) {
        this.instance.unsubscribe()
        if (!v) return
        this.instance.employeeId = v
        this.items = this.instance.subscribeDocs([
          ['where', 'employeeId', '==', v],
        ])
      },
      immediate: true,
    },
  },

  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.instance.unsubscribe()
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    next() {
      this.window = this.window + 1 === this.length ? 0 : this.window + 1
    },
    prev() {
      this.window = this.window - 1 < 0 ? this.length - 1 : this.window - 1
    },
  },
}
</script>

<template>
  <g-collection-manager
    :dialog-props="{ maxWidth: 600 }"
    :instance="instance"
    :items="computedItems"
    label="健康保険情報編集"
  >
    <template #default="{ toRegist, toUpdate }">
      <g-card-floating-label-v-2
        :color="color"
        dark
        icon="mdi-hospital-box"
        label="健康保険"
        :menu-items="[
          { text: '追加', icon: 'mdi-plus', action: toRegist },
          {
            text: '変更',
            icon: 'mdi-pencil',
            action: () => toUpdate(computedItems[window]),
            disabled: computedItems.length === 0,
          },
        ]"
      >
        <v-container>
          <v-window v-if="items.length !== 0" v-model="window">
            <v-window-item v-for="(item, index) in computedItems" :key="index">
              <g-card-health-insurance v-bind="item" :color="color" />
            </v-window-item>
          </v-window>
          <v-card v-else outlined>
            <v-card-text>加入していません。</v-card-text>
          </v-card>
        </v-container>
        <v-card-actions class="justify-space-between">
          <v-btn text @click="prev">
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <v-item-group v-model="window" class="text-center" mandatory>
            <v-item
              v-for="n in items.length"
              :key="`btn-${n}`"
              v-slot="{ active, toggle }"
            >
              <v-btn :input-value="active" icon @click="toggle">
                <v-icon>mdi-record</v-icon>
              </v-btn>
            </v-item>
          </v-item-group>
          <v-btn text @click="next">
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </v-card-actions>
      </g-card-floating-label-v-2>
    </template>
    <template #inputs="{ attrs, on }">
      <g-input-health-insurance v-bind="attrs" hide-employee v-on="on" />
    </template>
  </g-collection-manager>
</template>

<style></style>
