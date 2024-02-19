<script>
import { props } from '~/models/Site'
/**
 * ## GSimpleTableSite
 *
 * @author shisyamo4131
 */
export default {
  mixins: [props],
}
</script>

<template>
  <v-simple-table>
    <tbody>
      <tr>
        <td>CODE</td>
        <td>{{ code }}</td>
      </tr>
      <tr>
        <td>取引先</td>
        <td>{{ customer.abbr }}</td>
      </tr>
      <tr>
        <td>現場名</td>
        <td>{{ name }}</td>
      </tr>
      <tr>
        <td>略称</td>
        <td>{{ abbr }}</td>
      </tr>
      <tr>
        <td>略称カナ</td>
        <td>{{ abbrKana }}</td>
      </tr>
      <tr>
        <td>住所</td>
        <td>{{ address }}</td>
      </tr>
      <tr>
        <td>略称番号</td>
        <td>{{ abbrNumber }}</td>
      </tr>
      <tr>
        <td>開始日</td>
        <td>{{ startAt }}</td>
      </tr>
      <tr>
        <td>終了日</td>
        <td>{{ endAt }}</td>
      </tr>
      <tr>
        <td>備考</td>
        <td>
          <p style="white-space: pre-line">
            {{ remarks }}
          </p>
        </td>
      </tr>
    </tbody>
  </v-simple-table>
</template>

<style></style>
