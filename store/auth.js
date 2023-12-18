import { signInWithEmailAndPassword, signOut } from 'firebase/auth'

/******************************************************************
 * STATE
 ******************************************************************/
export const state = () => ({
  // Authentication user object.
  user: null,
})
/******************************************************************
 * GETTERS
 ******************************************************************/
export const getters = {
  uid(state) {
    return state.user?.uid || undefined
  },
  // Returns authenticated or not.
  isAuthenticated(state) {
    return !!state.user
  },
  // Returns user roles as array.
  roles(state) {
    return state.user?.roles || []
  },
}
/******************************************************************
 * MUTATIONS
 ******************************************************************/
export const mutations = {
  setUser(state, payload) {
    state.user = payload
  },
}
/******************************************************************
 * ACTIONS
 ******************************************************************/
export const actions = {
  async activate(context, user) {
    const idTokenResult = await user.getIdTokenResult()
    context.commit('setUser', {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      isEmailVerified: user.emailVerified,
      roles: idTokenResult.claims.roles || [],
    })
  },
  disactivate(context) {
    return new Promise((resolve) => {
      context.commit('setUser', null)
      resolve()
    })
  },
  /**
   * 引数にemailとpasswordを受け取り、Firebase Authenticationの
   * メールアドレス認証を行います。
   * 認証が完了するとthis$auth.currentUserにオブジェクトがセットされます。
   * 認証に失敗するとエラーがthrowされます。
   * @param {*} payload { email, password }
   */
  async signInWithEmailAndPassword(_, payload) {
    const email = payload?.email || undefined
    const password = payload?.password || undefined
    await signInWithEmailAndPassword(this.$auth, email, password)
  },

  /**
   * Firebase Authenticationの認証を解除（sign-out）します。
   */
  async signOut() {
    await signOut(this.$auth)
  },
}
