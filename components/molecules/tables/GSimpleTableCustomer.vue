<template>
  <v-simple-table>
    <tbody>
      <tr>
        <td>CODE</td>
        <td>{{ model.code }}</td>
      </tr>
      <tr>
        <td>取引先名1</td>
        <td>{{ model.name1 }}</td>
      </tr>
      <tr>
        <td>取引先名2</td>
        <td>{{ model.name2 }}</td>
      </tr>
      <tr>
        <td>略称</td>
        <td>{{ model.abbr }}</td>
      </tr>
      <tr>
        <td>略称カナ</td>
        <td>{{ model.abbrKana }}</td>
      </tr>
      <tr>
        <td>住所</td>
        <td>{{ model.address }}</td>
      </tr>
    </tbody>
  </v-simple-table>
</template>

<script>
export default {}
</script>

<style></style>
