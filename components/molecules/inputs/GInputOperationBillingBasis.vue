<script>
/**
 * OperationBillingBasisドキュメント入力コンポーネント
 *
 * @author shisyamo4131
 * @version 1.0.0
 * @updates
 * - version 1.0.0 - 2024-10-02 - 初版作成
 */
import GCardInputForm from '../cards/GCardInputForm.vue'
import GInputOperationResultWorkers from './GInputOperationResultWorkers.vue'
import GInputOperationResultOutsourcers from './GInputOperationResultOutsourcers.vue'
import OperationBillingBasis from '~/models/OperationBillingBasis'
import GInputSubmitMixin from '~/mixins/GInputSubmitMixin'
import GNumeric from '~/components/atoms/inputs/GNumeric.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GInputOperationResultWorkers,
    GCardInputForm,
    GInputOperationResultOutsourcers,
    GNumeric,
  },
  /***************************************************************************
   * MIXINS
   ***************************************************************************/
  mixins: [GInputSubmitMixin],
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    instance: {
      type: Object,
      required: true,
      validator(instance) {
        return instance instanceof OperationBillingBasis
      },
    },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      editModel: new OperationBillingBasis(),
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {},
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {},
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {},
}
</script>

<template>
  <g-card-input-form
    v-bind="$attrs"
    label="稼働実績請求明細編集"
    :edit-mode="editMode"
    :loading="loading"
    @click:submit="submit"
    v-on="$listeners"
  >
    <v-form @submit.prevent>
      <v-row>
        <v-col cols="12" lg="3">
          <v-card outlined>
            <v-card-text>
              <!-- INFO WRAPPER -->
              <div class="info-wrapper">
                <!-- CODE -->
                <div class="info-item">
                  <div class="info-title">
                    <v-icon left small>mdi-code-tags</v-icon>
                    <span class="font-weight-bold">CODE:</span>
                  </div>
                  <div class="info-value">
                    {{ editModel.code }}
                  </div>
                </div>

                <!-- 現場 -->
                <div class="info-item">
                  <div class="info-title">
                    <v-icon left small>mdi-map-marker</v-icon>
                    <span class="font-weight-bold">現場:</span>
                  </div>
                  <div class="info-value">
                    {{ editModel.site?.abbr || '' }}
                  </div>
                </div>

                <!-- 日付 -->
                <div class="info-item">
                  <div class="info-title">
                    <v-icon left small>mdi-calendar</v-icon>
                    <span class="font-weight-bold">日付:</span>
                  </div>
                  <div class="info-value">
                    {{ editModel.date }}
                  </div>
                </div>

                <!-- 曜日区分 -->
                <div class="info-item">
                  <div class="info-title">
                    <v-icon left small>mdi-calendar-week</v-icon>
                    <span class="font-weight-bold">曜日区分:</span>
                  </div>
                  <div class="info-value">
                    {{ editModel.dayDiv }}
                  </div>
                </div>

                <!-- 勤務区分 -->
                <div class="info-item">
                  <div class="info-title">
                    <v-icon left small>mdi-timetable</v-icon>
                    <span class="font-weight-bold">勤務区分:</span>
                  </div>
                  <div class="info-value">
                    {{ editModel.workShift }}
                  </div>
                </div>

                <!-- 締日 -->
                <div class="info-item">
                  <div class="info-title">
                    <v-icon left small>mdi-calendar-check</v-icon>
                    <span class="font-weight-bold">締日:</span>
                  </div>
                  <div class="info-value">
                    {{ editModel.closingDate }}
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" lg="9">
          <div class="d-flex flex-column flex-grow-1">
            <v-card outlined>
              <g-input-operation-result-workers :value="editModel.workers" />
            </v-card>
          </div>
          <div class="d-flex flex-column flex-grow-1">
            <v-card outlined>
              <g-input-operation-result-outsourcers
                :value="editModel.outsourcers"
              />
            </v-card>
          </div>
          <div>
            <v-card outlined>
              <v-container>
                <v-row>
                  <v-col>
                    <v-card>
                      <v-card-text>
                        <h4 class="pb-4">資格なし</h4>
                        <div class="d-flex" style="gap: 8px">
                          <g-numeric
                            v-model="editModel.operationCount.standard.normal"
                            class="right-input"
                            label="通常人工"
                            required
                            suffix="人工"
                          />
                          <g-numeric
                            v-model="editModel.unitPrice.standard.price"
                            class="right-input"
                            label="基本単価"
                            required
                            suffix="円"
                          />
                          <g-numeric
                            v-model="editModel.sales.standard.normal"
                            class="right-input"
                            label="通常稼働請求額"
                            readonly
                            suffix="円"
                          />
                        </div>
                        <div class="d-flex" style="gap: 8px">
                          <g-numeric
                            v-model="editModel.operationCount.standard.half"
                            class="right-input"
                            label="半勤人工"
                            required
                            suffix="人工"
                          />
                          <g-numeric
                            :value="
                              (editModel.unitPrice.standard.price *
                                editModel.unitPrice.halfRate) /
                              100
                            "
                            class="right-input"
                            label="半勤単価"
                            required
                            suffix="円"
                          />
                          <g-numeric
                            v-model="editModel.sales.standard.half"
                            class="right-input"
                            label="半勤稼働請求額"
                            readonly
                            suffix="円"
                          />
                        </div>
                        <div class="d-flex" style="gap: 8px">
                          <g-numeric
                            v-model="editModel.operationCount.standard.cancel"
                            class="right-input"
                            label="中止人工"
                            required
                            suffix="人工"
                          />
                          <g-numeric
                            :value="
                              (editModel.unitPrice.standard.price *
                                editModel.unitPrice.cancelRate) /
                              100
                            "
                            class="right-input"
                            label="中止単価"
                            required
                            suffix="円"
                          />
                          <g-numeric
                            v-model="editModel.sales.standard.cancel"
                            class="right-input"
                            label="中止稼働請求額"
                            readonly
                            suffix="円"
                          />
                        </div>
                        <div class="d-flex" style="gap: 8px">
                          <g-numeric
                            v-model="
                              editModel.operationCount.standard.overtimeMinutes
                            "
                            class="right-input"
                            label="残業時間"
                            required
                            suffix="時間"
                          />
                          <g-numeric
                            :value="editModel.unitPrice.standard.overtime"
                            class="right-input"
                            label="残業単価"
                            required
                            suffix="円"
                          />
                          <g-numeric
                            v-model="editModel.sales.standard.overtime"
                            class="right-input"
                            label="残業請求額"
                            readonly
                            suffix="円"
                          />
                        </div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <v-col>
                    <v-card>
                      <v-card-text>
                        <h4 class="pb-4">資格あり</h4>
                        <div class="d-flex" style="gap: 8px">
                          <g-numeric
                            v-model="editModel.operationCount.qualified.normal"
                            class="right-input"
                            label="通常人工"
                            required
                            suffix="人工"
                          />
                          <g-numeric
                            v-model="editModel.unitPrice.qualified.price"
                            class="right-input"
                            label="基本単価"
                            required
                            suffix="円"
                          />
                          <g-numeric
                            v-model="editModel.sales.qualified.normal"
                            class="right-input"
                            label="通常稼働請求額"
                            readonly
                            suffix="円"
                          />
                        </div>
                        <div class="d-flex" style="gap: 8px">
                          <g-numeric
                            v-model="editModel.operationCount.qualified.half"
                            class="right-input"
                            label="半勤人工"
                            required
                            suffix="人工"
                          />
                          <g-numeric
                            :value="
                              (editModel.unitPrice.qualified.price *
                                editModel.unitPrice.halfRate) /
                              100
                            "
                            class="right-input"
                            label="半勤単価"
                            required
                            suffix="円"
                          />
                          <g-numeric
                            v-model="editModel.sales.qualified.half"
                            class="right-input"
                            label="半勤稼働請求額"
                            readonly
                            suffix="円"
                          />
                        </div>
                        <div class="d-flex" style="gap: 8px">
                          <g-numeric
                            v-model="editModel.operationCount.qualified.cancel"
                            class="right-input"
                            label="中止人工"
                            required
                            suffix="人工"
                          />
                          <g-numeric
                            :value="
                              (editModel.unitPrice.qualified.price *
                                editModel.unitPrice.cancelRate) /
                              100
                            "
                            class="right-input"
                            label="中止単価"
                            required
                            suffix="円"
                          />
                          <g-numeric
                            v-model="editModel.sales.qualified.cancel"
                            class="right-input"
                            label="中止稼働請求額"
                            readonly
                            suffix="円"
                          />
                        </div>
                        <div class="d-flex" style="gap: 8px">
                          <g-numeric
                            v-model="
                              editModel.operationCount.qualified.overtimeMinutes
                            "
                            class="right-input"
                            label="残業時間"
                            required
                            suffix="時間"
                          />
                          <g-numeric
                            :value="editModel.unitPrice.qualified.overtime"
                            class="right-input"
                            label="残業単価"
                            required
                            suffix="円"
                          />
                          <g-numeric
                            v-model="editModel.sales.qualified.overtime"
                            class="right-input"
                            label="残業請求額"
                            readonly
                            suffix="円"
                          />
                        </div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-container>
            </v-card>
          </div>
        </v-col>
      </v-row>
    </v-form>
  </g-card-input-form>
</template>

<style>
.info-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px; /* 全体の要素間の余白を一括で管理 */
}

.info-item {
  display: flex;
  gap: 8px; /* タイトルと値の間の余白 */
  align-items: center;
}

.info-title {
  min-width: 144px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.info-value {
  min-width: 144px;
  flex-grow: 1;
  word-wrap: break-word;
}
</style>
