<script>
import GCardFloatingLabel from '../../atoms/cards/GCardFloatingLabel.vue'
import EmploymentInsurance from '~/models/EmploymentInsurance'
import GMixinEditModeProvider from '~/mixins/GMixinEditModeProvider'
import GCardEmploymentInsurance from '~/components/atoms/cards/GCardEmploymentInsurance.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GCardFloatingLabel, GCardEmploymentInsurance },

  /***************************************************************************
   * MIXINS
   ***************************************************************************/
  mixins: [GMixinEditModeProvider],

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * コンポーネントのカラーです。
     */
    color: { type: String, default: undefined, required: false },

    /**
     * 管理対象の従業員IDです。
     */
    employeeId: { type: String, required: true },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      docs: [],
      instance: new EmploymentInsurance(),
    }
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    /**
     * 従業員IDが変更されたら雇用保険ドキュメントの購読を開始します。
     */
    employeeId: {
      handler(v) {
        this.instance.employeeId = v
        this.docs = this.instance.subscribeDocs([
          ['where', 'employeeId', '==', v],
          ['orderBy', 'acquisitionDate', 'desc'],
          ['limit', 3],
        ])
      },
      immediate: true,
    },
  },

  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    // 雇用保険ドキュメントの購読を解除します。
    this.instance.unsubscribe()
  },
}
</script>

<template>
  <g-card-floating-label
    v-bind="$attrs"
    :color="color"
    label="雇用保険"
    icon="mdi-shield-account"
  >
    <v-container>
      <v-data-iterator
        :items="docs"
        hide-default-footer
        sort-by="acquisitionDate"
        sort-by-desc
      >
        <template #default="{ items }">
          <v-window :value="items.length - 1" show-arrows show-arrows-on-hover>
            <v-window-item v-for="doc in items" :key="doc.docId">
              <g-card-employment-insurance
                v-bind="doc"
                :color="color"
                outlined
              />
            </v-window-item>
          </v-window>
        </template>
        <template #no-data>
          <v-card outlined>
            <v-card-text>加入していません。</v-card-text>
          </v-card>
        </template>
      </v-data-iterator>
    </v-container>
  </g-card-floating-label>
</template>

<style></style>
