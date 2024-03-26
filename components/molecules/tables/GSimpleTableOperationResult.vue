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
        <td>警備士A</td>
        <td>
          {{
            `${
              workers.qualified.normal +
              workers.qualified.half +
              workers.qualified.canceled
            } 人工`
          }}
          {{
            `（半勤: ${(
              workers.qualified.half || 0
            ).toLocaleString()}  中止: ${(
              workers.qualified.canceled || 0
            ).toLocaleString()}）`
          }}
        </td>
      </tr>
      <tr>
        <td>警備士B</td>
        <td>
          {{
            `${
              workers.standard.normal +
              workers.standard.half +
              workers.standard.canceled
            } 人工`
          }}
          {{
            `（半勤: ${(workers.standard.half || 0).toLocaleString()}  中止: ${(
              workers.standard.canceled || 0
            ).toLocaleString()}）`
          }}
        </td>
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
