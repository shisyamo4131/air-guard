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
        <td>氏名カナ</td>
        <td>{{ `${lastNameKana} ${firstNameKana}` }}</td>
      </tr>
      <tr>
        <td>略称</td>
        <td>{{ abbr }}</td>
      </tr>
      <tr>
        <td>性別</td>
        <td>{{ gender }}</td>
      </tr>
      <tr>
        <td>郵便番号</td>
        <td>{{ zipcode }}</td>
      </tr>
      <tr>
        <td>住所</td>
        <td>{{ address1 }}</td>
      </tr>
      <tr>
        <td>建物名・階数</td>
        <td>{{ address2 }}</td>
      </tr>
      <tr>
        <td>電話番号</td>
        <td>{{ tel }}</td>
      </tr>
      <tr>
        <td>携帯電話</td>
        <td>{{ mobile }}</td>
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
