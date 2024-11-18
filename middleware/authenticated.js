/**
 * authenticated.js
 *
 * Middleware to handle authentication, maintenance mode, and access control.
 *
 * Copyright 2022 Daizo Maruyama. All Rights Reserved.
 */

const STORE_GETTERS = {
  IS_AUTHENTICATED: 'auth/isAuthenticated',
  ROLES: 'auth/roles',
}
const pages = require('@/assets/pagePermissions')

export default ({ store, route, redirect }) => {
  const isAuthenticated = store.getters[STORE_GETTERS.IS_AUTHENTICATED]
  const userRoles = store.getters[STORE_GETTERS.ROLES] || []
  const publicPages = ['login', 'register']
  const isMaintenance = store.state.systems.maintenanceMode

  /**
   * Handle login page access:
   * - Redirect authenticated users to the top page.
   * - Allow unauthenticated users to proceed.
   */
  if (route.name === 'login') {
    if (isAuthenticated) {
      return redirect('/')
    }
    return
  }

  /**
   * Handle maintenance mode:
   * - Redirect non-admin users to the maintenance page if they try to access other pages.
   */
  if (
    isMaintenance &&
    route.name !== 'maintenancing' &&
    !userRoles.includes('admin')
  ) {
    return redirect('/maintenancing')
  }

  /**
   * Handle unauthenticated users:
   * - Redirect to the login page if trying to access non-public pages.
   */
  if (!isAuthenticated) {
    if (!publicPages.includes(route.name)) {
      return redirect('/login')
    }
    return
  }

  /**
   * Handle authenticated users:
   * - Check if the user has permission to access the requested page.
   * - Redirect to the top page if they do not have the required permissions.
   */
  const permissions = pages[route.name] || []
  if (
    permissions.length > 0 &&
    !permissions.some((role) => userRoles.includes(role))
  ) {
    return redirect('/')
  }
}
