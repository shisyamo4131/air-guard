<script>
import { props } from '~/models/Employee'
/**
 * ## GSimpleTableEmployee
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
        <td>氏名</td>
        <td>{{ `${lastName} ${firstName}` }}</td>
      </tr>
      <tr>
        <td>略称</td>
        <td>{{ abbr }}</td>
      </tr>
      <tr>
        <td>氏名カナ</td>
        <td>{{ `${lastNameKana} ${firstNameKana}` }}</td>
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
