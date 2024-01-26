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
    </tbody>
  </v-simple-table>
</template>

<style></style>
