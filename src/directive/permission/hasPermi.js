
import { useUserStore } from '@/stores/user'

export default {
  mounted(el, binding, vnode) {
    const { value } = binding
    const all_permission = "*:*:*"
    const userStore = useUserStore()
    const permissions = userStore.userInfo.permissions || []

    if (value && (value instanceof Array || typeof value === 'string')) {
      const permissionFlag = value instanceof Array ? value : [value]
      if (permissionFlag.length === 0) {
        throw new Error(`请设置操作权限标签值`)
      }

      const hasPermissions = permissions.some(permission => {
        return all_permission === permission || permission === '*' || permissionFlag.includes(permission)
      })

      if (!hasPermissions) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else {
      throw new Error(`请设置操作权限标签值`)
    }
  }
}
