<template>
  <v-card v-bind="$attrs" v-on="$listeners">
    <v-toolbar flat>
      <v-radio-group v-model="type" row hide-details>
        <v-radio
          v-for="item of types"
          :key="item.value"
          :label="item.text"
          :value="item.value"
        />
      </v-radio-group>
    </v-toolbar>
    <v-card-text class="pt-0">
      <g-data-table-operation-results
        :items="items"
        :page.sync="page"
        @page-count="pageCount = $event"
      />
      <v-toolbar class="flex-grow-0" flat>
        <v-row justify="center">
          <v-col cols="10">
            <v-pagination
              v-model="page"
              :length="pageCount"
              total-visible="20"
            />
          </v-col>
        </v-row>
      </v-toolbar>
    </v-card-text>
  </v-card>
</template>

<script>
import GDataTableOperationResults from '../../atoms/tables/GDataTableOperationResults.vue'
import OperationResult from '~/models/OperationResult'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GDataTableOperationResults },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    siteId: { type: String, default: undefined, required: false },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      currentDate: this.$dayjs().format('YYYY-MM-DD'),
      instance: new OperationResult(),
      items: [], // 稼働実績ドキュメントの配列
      page: 1,
      pageCount: 0,
      type: 'current',
      types: [
        { text: '直近10件', value: 'current' },
        { text: '過去3ヶ月', value: '3months' },
        { text: '過去6ヶ月', value: '6months' },
      ],
    }
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    /**
     * 現場IDを監視します。
     * - 稼働実績ドキュメントへの購読を開始します。
     */
    siteId: {
      handler() {
        this.subscribe()
      },
      immediate: true,
    },

    /**
     * typeを監視します。
     * - 稼働実績ドキュメントへの購読を開始します。
     */
    type() {
      this.subscribe()
    },
  },

  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.unsubscribe()
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * 稼働実績ドキュメントへのリアルタイムリスナーをセットします。
     */
    subscribe() {
      // 一旦購読を解除
      this.unsubscribe()

      // 現場IDが指定されていなければ終了
      if (!this.siteId) return

      // ベースとなる抽出条件を設定
      const condition = [
        ['where', 'siteId', '==', this.siteId],
        ['orderBy', 'date', 'desc'],
      ]

      // typeに合わせて抽出条件を追加
      // 堅牢性を保つため（不要な読み込みを避けるため）、 `current` を含めた想定外の条件に対して limit を指定。
      if (this.type === '3months') {
        const from = this.$dayjs().subtract(3, 'month').format('YYYY-MM-DD')
        condition.push(['where', 'date', '>=', from])
      } else if (this.type === '6months') {
        const from = this.$dayjs().subtract(6, 'month').format('YYYY-MM-DD')
        condition.push(['where', 'date', '>=', from])
      } else {
        condition.push(['limit', 10])
      }
      this.items = this.instance.subscribeDocs(condition)
    },

    /**
     * 稼働実績ドキュメントに対する購読を解除します。
     * - 読み込んだ稼働実績ドキュメントも初期化します。
     */
    unsubscribe() {
      this.instance.unsubscribe()
      this.items.splice(0)
    },
  },
}
</script>

<style></style>
