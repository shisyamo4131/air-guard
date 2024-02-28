<script>
import { props } from '~/models/OperationResult'
/**
 * ## GSimpleTableOperationResult
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
        <td>日付</td>
        <td>{{ date }}</td>
      </tr>
      <tr>
        <td>現場</td>
        <td>{{ site.abbr }}</td>
      </tr>
      <tr>
        <td>売上</td>
        <td>{{ `${(sales || 0).toLocaleString()} 円` }}</td>
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
