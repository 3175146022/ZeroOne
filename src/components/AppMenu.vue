<template>
  <el-menu
    :default-active="activeMenu"
    :class="['el-menu-vertical-demo', { 'no-border': mode === 'horizontal' }]"
    :background-color="menuBackgroundColor"
    :text-color="menuTextColor"
    :active-text-color="menuActiveTextColor"
    :style="menuStyle"
    :collapse="isCollapse && mode === 'vertical'"
    :mode="mode"
    :collapse-transition="false"
    router
  >
    <div class="logo" v-if="showLogo && mode === 'vertical'">
      <h3 v-if="!isCollapse">ZeroOne System</h3>
      <h3 v-else>ZO</h3>
    </div>
    <template v-for="item in displayMenus" :key="item.path">
      <template v-if="!item.hidden">
        <el-sub-menu v-if="item.children && item.children.length > 0" :index="resolvePath(item.path)">
          <template #title>
            <el-icon v-if="item.icon && !isUrl(item.icon)"><component :is="item.icon" /></el-icon>
            <img v-else-if="item.icon && isUrl(item.icon)" :src="item.icon" class="menu-icon" />
            <span>{{ item.title }}</span>
          </template>
          <template v-for="child in item.children" :key="child.path">
            <el-menu-item v-if="!child.hidden" :index="resolvePath(child.path, item.path)">
              <el-icon v-if="child.icon && !isUrl(child.icon)"><component :is="child.icon" /></el-icon>
              <img v-else-if="child.icon && isUrl(child.icon)" :src="child.icon" class="menu-icon" />
              <span>{{ child.title }}</span>
            </el-menu-item>
          </template>
        </el-sub-menu>
        <el-menu-item v-else :index="resolvePath(item.path)">
          <el-icon v-if="item.icon && !isUrl(item.icon)"><component :is="item.icon" /></el-icon>
          <img v-else-if="item.icon && isUrl(item.icon)" :src="item.icon" class="menu-icon" />
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </template>
    </template>
  </el-menu>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  menuList: {
    type: Array,
    default: () => []
  },
  isCollapse: {
    type: Boolean,
    default: false
  },
  mode: {
    type: String,
    default: 'vertical'
  },
  showLogo: {
    type: Boolean,
    default: true
  },
  theme: {
    type: String,
    default: 'light'
  },
  backgroundColor: {
    type: String,
    default: ''
  },
  textColor: {
    type: String,
    default: ''
  },
  activeTextColor: {
    type: String,
    default: ''
  }
})

const route = useRoute()

const displayMenus = computed(() => {
  if (props.menuList && props.menuList.length > 0) return props.menuList
  return [
    { path: '/dashboard', title: '仪表盘', icon: 'DataLine' },
    { 
      path: '/system', 
      title: '系统管理', 
      icon: 'User',
      children: [
        { path: '/system/role', title: '角色管理', icon: 'UserFilled' }
      ]
    }
  ]
})

const activeMenu = computed(() => route.path)

const isDark = computed(() => props.theme === 'dark')

const menuBackgroundColor = computed(() => {
  if (props.backgroundColor) return props.backgroundColor
  return isDark.value ? '#273352' : '#ffffff'
})

const menuTextColor = computed(() => {
  if (props.textColor) return props.textColor
  return isDark.value ? '#fff' : '#303133'
})

const menuActiveTextColor = computed(() => {
  if (props.activeTextColor) return props.activeTextColor
  return '#ffd04b'
})

const menuStyle = computed(() => {
  if (props.mode === 'vertical') {
    return { height: '100%', borderRight: 'none' }
  }
  return { borderBottom: 'none', height: '60px' }
})

const isUrl = (path) => {
  return /^(https?:|mailto:|tel:)/.test(path)
}

const resolvePath = (routePath, basePath = '') => {
  if (isUrl(routePath)) {
    return routePath
  }
  if (isUrl(basePath)) {
    return basePath
  }
  
  if (routePath.startsWith('/')) {
      return routePath
  }
  
  // simple path join
  const result = basePath === '/' ? '/' + routePath : basePath + '/' + routePath
  return result.replace(/\/+/g, '/')
}
</script>

<style scoped>
.menu-icon {
  width: 1em;
  height: 1em;
  margin-right: 8px;
  vertical-align: middle;
}
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
}
.el-menu-vertical-demo.no-border {
  border: none;
  width: auto;
}
.logo {
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  border-bottom: 1px solid #434a50;
  white-space: nowrap;
  overflow: hidden;
}
</style>
