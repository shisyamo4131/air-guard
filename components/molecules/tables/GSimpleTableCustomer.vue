<script>
import { props } from '~/models/Customer'
/**
 * ## GSimpleTableCustomer
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
        <td>取引先名1</td>
        <td>{{ name1 }}</td>
      </tr>
      <tr>
        <td>取引先名2</td>
        <td>{{ name2 }}</td>
      </tr>
      <tr>
        <td>略称</td>
        <td>
          <div class="text-caption grey--text text--darken-1">
            {{ abbrKana }}
          </div>
          <div>{{ abbr }}</div>
        </td>
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
        <td>FAX番号</td>
        <td>{{ fax }}</td>
      </tr>
      <tr>
        <td>締日</td>
        <td>{{ $DEADLINE[deadline] }}</td>
      </tr>
      <tr>
        <td>入金サイト</td>
        <td>
          {{ `${depositMonth}ヶ月後${$DEADLINE[depositDate]}` }}
        </td>
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
