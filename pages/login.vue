<template>
  <air-login-form
    class="mx-auto"
    min-width="360"
    label="Login - AirGuard -"
    :loading="loading"
    @click:login="login($event)"
  >
    <template #error>
      <div v-show="msg" class="error--text text-center">{{ msg }}</div>
    </template>
  </air-login-form>
</template>

<script>
export default {
  /******************************************************************
   * LAYOUT
   ******************************************************************/
  layout: 'public',
  /******************************************************************
   * DATA
   ******************************************************************/
  data() {
    return {
      loading: false,
      msg: '',
      errCodes: {
        'auth/invalid-email': 'メールアドレスが登録されていません。',
        'auth/wrong-password': 'メールアドレスまたはパスワードが異なります。',
      },
    }
  },
  /******************************************************************
   * METHODS
   ******************************************************************/
  methods: {
    async login(v) {
      try {
        this.loading = true
        await this.$store.dispatch('auth/signInWithEmailAndPassword', v)
        this.$router.push(`/`)
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        this.msg = this.errCodes[err.code] || 'ログインできませんでした。'
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style></style>
