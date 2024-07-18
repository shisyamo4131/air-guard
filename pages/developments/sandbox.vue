<template>
  <g-template-default>
    <v-container>
      <v-card>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <div class="d-flex">
                <div
                  class="align-self-center pr-2 text-truncate text-body-2"
                  style="min-width: 120px; width: 120px"
                >
                  * 月平均所定労働日数
                </div>
                <air-text-field />
              </div>
            </v-col>
            <v-col cols="12">
              <div class="d-flex flex-column">
                <air-text-field label="月平均所定労働日数" />
              </div>
            </v-col>
            <v-col cols="12">
              <v-text-field label="月平均所定労働日数" outlined />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-container>
  </g-template-default>
</template>

<script>
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
export default {
  components: { GTemplateDefault },
}
</script>

<style></style>
