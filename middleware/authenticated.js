/**
 * authenticated.js
 *
 * Copyright 2022 Daizo Maruyama. All Rights reserved.
 */

const STORE_GETTERS = {
  IS_AUTHENTICATED: 'auth/isAuthenticated',
  ROLES: 'auth/roles',
}
const pages = require('@/assets/pagePermissions')

export default ({ app, store, route, redirect, error }) => {
  const isAuthenticated = store.getters[STORE_GETTERS.IS_AUTHENTICATED]
  const userRoles = store.getters[STORE_GETTERS.ROLES] || []
  const publicPages = ['login', 'register']

  if (!isAuthenticated) {
    if (!publicPages.includes(route.name)) redirect('/login')
  } else if (publicPages.includes(route.name)) {
    redirect('/')
  }

  const permissions = pages[route.name] || []
  if (permissions.length) {
    const isApproved =
      permissions.filter((item) => userRoles.includes(item)).length > 0
    if (!isApproved) redirect('/')
  }
}
