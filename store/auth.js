import { auth, firestore } from 'air-firebase'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'

/******************************************************************
 * STATE
 ******************************************************************/
export const state = () => ({
  // Authentication user object.
  user: null,
  data: null,
  listener: null,
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
  // Returns if the user is developer or not.
  isAdmin(state) {
    const roles = state.user?.roles || []
    return roles.includes('admin')
  },
  // Returns if the user is developer or not.
  isDeveloper(state) {
    const roles = state.user?.roles || []
    return roles.includes('developer')
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
  setData(state, payload) {
    state.data = payload
  },
  setListener(state, listener) {
    state.listener = listener
  },
  removeListener(state) {
    if (state.listener) state.listener()
    state.listener = null
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
    const docRef = doc(firestore, `Users/${user.uid}`)
    const listener = onSnapshot(docRef, (doc) => {
      context.commit('setData', doc.data())
    })
    context.commit('setListener', listener)
  },
  disactivate(context) {
    return new Promise((resolve) => {
      context.commit('setUser', null)
      context.commit('removeListener')
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
    await signInWithEmailAndPassword(auth, email, password)
  },

  /**
   * Firebase Authenticationの認証を解除（sign-out）します。
   */
  async signOut() {
    await signOut(auth)
  },
}
