<template>
  <div class="common-layout" :class="{ 'mobile': isMobile }">
    <div v-if="isMobile && !isCollapse" class="drawer-bg" @click="isCollapse = true"></div>
    
    <!-- Vertical Layout -->
    <el-container v-if="settings.navMode === 'vertical' || isMobile" class="layout-container">
      <el-aside 
        :width="asideWidth" 
        class="aside-container" 
        :class="{ 'mobile-aside': isMobile }"
        :style="{ backgroundColor: settings.themeColor }"
      >
        <AppMenu 
          :is-collapse="isCollapse && !isMobile" 
          :show-logo="settings.showLogo"
          :theme="settings.isDark ? 'dark' : 'light'"
          :background-color="settings.themeColor"
          text-color="#fff"
          active-text-color="#ffd04b"
          :menu-list="menuList"
        />
      </el-aside>
      <el-container :style="{ marginLeft: isMobile ? '0' : asideWidth, transition: 'margin-left 0.3s' }">
        <el-header>
          <div class="header-content">
            <div class="header-left">
              <el-button 
                type="text" 
                class="collapse-btn" 
                @click="toggleCollapse"
              >
                <el-icon :size="20">
                  <Fold v-if="!isCollapse"/>
                  <Expand v-else/>
                </el-icon>
              </el-button>
              <el-breadcrumb separator="/" class="hidden-xs-only">
                <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
                <el-breadcrumb-item v-for="(item, index) in breadcrumbList" :key="index">
                  {{ item.meta.title }}
                </el-breadcrumb-item>
              </el-breadcrumb>
            </div>
            <div class="header-right">
              <div class="action-item">
                <el-icon :size="20"><Search /></el-icon>
              </div>
              <div class="action-item">
                <el-badge :value="12" class="item">
                  <el-icon :size="20"><Bell /></el-icon>
                </el-badge>
              </div>
              <el-dropdown trigger="click">
                <div class="user-info">
                  <el-avatar :size="32" :src="userStore.userInfo.avatar" />
                  <span class="username" v-if="!isMobile">{{ userStore.userInfo.nickname || userStore.userInfo.username }}</span>
                  <el-icon class="el-icon--right"><CaretBottom /></el-icon>
                </div>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="showSettings = true">布局设置</el-dropdown-item>
                    <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <div class="action-item" @click="showSettings = true">
                <el-icon :size="20"><Setting /></el-icon>
              </div>
            </div>
          </div>
        </el-header>
        <AppMain :hide-tags-view="settings.hideTagsView" :tags-style="settings.tagsStyle" />
      </el-container>
    </el-container>

    <!-- Horizontal Layout -->
    <el-container v-if="settings.navMode === 'horizontal'" class="layout-container is-horizontal">
      <el-header class="horizontal-header" :style="{ backgroundColor: settings.themeColor }">
        <div class="header-content">
          <div class="header-left" style="flex: 1; overflow: hidden;">
            <div class="logo-horizontal" v-if="settings.showLogo">ZeroOne System</div>
            <AppMenu 
              mode="horizontal" 
              :theme="settings.isDark ? 'dark' : 'light'" 
              :background-color="settings.themeColor"
              text-color="rgba(255, 255, 255, 0.85)"
              active-text-color="#fff"
              style="border-bottom: none; flex: 1; min-width: 0;" 
              :menu-list="menuList"
            />
          </div>
          <div class="header-right">
            <div class="action-item">
              <el-icon :size="20"><Search /></el-icon>
            </div>
            <div class="action-item">
              <el-badge :value="12" class="item">
                <el-icon :size="20"><Bell /></el-icon>
              </el-badge>
            </div>
            <el-dropdown trigger="click">
              <div class="user-info">
                <el-avatar :size="32" :src="userStore.userInfo.avatar" />
                <span class="username">{{ userStore.userInfo.nickname || userStore.userInfo.username }}</span>
                <el-icon class="el-icon--right"><CaretBottom /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="showSettings = true">布局设置</el-dropdown-item>
                  <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <div class="action-item" @click="showSettings = true">
              <el-icon :size="20"><Setting /></el-icon>
            </div>
          </div>
        </div>
      </el-header>
      <AppMain :hide-tags-view="settings.hideTagsView" :tags-style="settings.tagsStyle" />
    </el-container>

    <!-- Mix Layout -->
    <el-container v-else-if="settings.navMode === 'mix'" class="layout-container is-mix">
      <el-header class="horizontal-header" :style="{ backgroundColor: settings.themeColor }">
        <div class="header-content">
          <div class="header-left" style="flex: 1; overflow: hidden;">
            <div class="logo-horizontal" v-if="settings.showLogo">ZeroOne</div>
            <AppMenu 
              mode="horizontal" 
              :theme="settings.isDark ? 'dark' : 'light'" 
              :background-color="settings.themeColor"
              text-color="rgba(255, 255, 255, 0.85)"
              active-text-color="#fff"
              style="border-bottom: none; flex: 1; min-width: 0;" 
              :menu-list="topMenus"
            />
          </div>
          <div class="header-right">
             <div class="action-item">
              <el-icon :size="20"><Search /></el-icon>
            </div>
            <div class="action-item">
              <el-badge :value="12" class="item">
                <el-icon :size="20"><Bell /></el-icon>
              </el-badge>
            </div>
            <el-dropdown trigger="click">
              <div class="user-info">
                <el-avatar :size="32" :src="userStore.userInfo.avatar" />
                <span class="username">{{ userStore.userInfo.nickname || userStore.userInfo.username }}</span>
                <el-icon class="el-icon--right"><CaretBottom /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="showSettings = true">布局设置</el-dropdown-item>
                  <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <div class="action-item" @click="showSettings = true">
              <el-icon :size="20"><Setting /></el-icon>
            </div>
          </div>
        </div>
      </el-header>
      <el-container>
        <el-aside width="200px" class="aside-container-mix" :style="{ backgroundColor: settings.themeColor }" v-if="sideMenus.length > 0">
          <AppMenu 
            :is-collapse="false" 
            :show-logo="false" 
            theme="dark" 
            :background-color="settings.themeColor"
            :menu-list="sideMenus"
          />
        </el-aside>
        <el-container>
          <AppMain :hide-tags-view="settings.hideTagsView" :tags-style="settings.tagsStyle" />
        </el-container>
      </el-container>
    </el-container>

    <SettingsDrawer v-model="showSettings" v-model:settings="settings" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { DataLine, User, Setting, Fold, Expand, Search, Bell, CaretBottom } from '@element-plus/icons-vue'
import SettingsDrawer from './SettingsDrawer.vue'
import AppMenu from './AppMenu.vue'
import AppMain from './AppMain.vue'
import { useUserStore } from '../stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

function handleLogout() {
  ElMessageBox.confirm('确定注销并退出系统吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logout().then(() => {
      router.push('/login')
      ElMessage.success('退出登录成功')
    })
  }).catch(() => {})
}

const isCollapse = ref(false)
const isMobile = ref(false)
const windowWidth = ref(window.innerWidth)
const showSettings = ref(false)

const settings = ref({
  navMode: 'vertical',
  themeColor: '#273352',
  isDark: false,
  grayMode: false,
  weakMode: false,
  hideTagsView: false,
  showLogo: true,
  tagsViewPersist: false,
  tagsStyle: 'smart'
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
  const result = basePath === '/' ? '/' + routePath : basePath + '/' + routePath
  return result.replace(/\/+/g, '/')
}

const formatMenus = (routes, basePath = '') => {
  return routes.map(route => {
    const fullPath = resolvePath(route.path, basePath)
    const menu = {
      path: fullPath,
      title: route.meta?.title || route.title,
      icon: route.meta?.icon || route.icon,
      children: route.children ? formatMenus(route.children, fullPath) : []
    }
    return menu
  })
}

const menuList = computed(() => {
  const staticMenu = [
    {
      path: '/dashboard',
      title: '首页',
      icon: 'DataLine',
      children: []
    }
  ]
  return [...staticMenu, ...formatMenus(userStore.menus)]
})

// Mix 模式下顶部菜单：只显示一级，如果一级有子菜单，将其 path 指向第一个子菜单，并清空 children 以便渲染为叶子节点
const topMenus = computed(() => {
  return menuList.value.map(item => {
    const newItem = { ...item }
    if (newItem.children && newItem.children.length > 0) {
      newItem.path = newItem.children[0].path
      newItem.children = []
    }
    return newItem
  })
})

// Mix 模式下侧边栏菜单：根据当前路由匹配一级菜单，返回其 children
const sideMenus = computed(() => {
  const currentPath = route.path
  for (const item of menuList.value) {
    if (item.path === currentPath) return item.children || []
    if (item.children && item.children.length > 0) {
      if (currentPath.startsWith(item.path) || item.children.some(child => currentPath.startsWith(child.path))) {
        return item.children
      }
    }
  }
  return []
})

const asideWidth = computed(() => {
  if (isMobile.value) {
    return isCollapse.value ? '0' : '200px'
  }
  return isCollapse.value ? '64px' : '200px'
})

const breadcrumbList = computed(() => {
  return route.matched.filter(item => item.meta && item.meta.title)
})

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const handleResize = () => {
  windowWidth.value = window.innerWidth
  const mobile = window.innerWidth < 768
  isMobile.value = mobile
  
  if (mobile) {
    if (!isCollapse.value) {
      isCollapse.value = true
    }
  }
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.common-layout {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.layout-container {
  height: 100%;
  width: 100%;
}

.main-content-container {
  height: 100%;
}

.aside-container {
  transition: width 0.3s;
  overflow: hidden;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 1001;
  background-color: #273352;
}

.aside-container-mix {
  background-color: #273352;
  height: calc(100vh - 60px);
  overflow-y: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.aside-container-mix::-webkit-scrollbar {
  display: none;
}

.el-header {
  background-color: var(--el-bg-color, #fff);
  color: var(--el-text-color-primary, #333);
  line-height: 60px;
  border-bottom: 1px solid var(--el-border-color, #eee);
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  width: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.action-item {
  cursor: pointer;
  display: flex;
  align-items: center;
  line-height: normal;
  height: 100%;
}

.action-item .el-badge {
  display: flex;
  align-items: center;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: var(--el-text-color-primary, #333);
  padding: 0;
  height: auto;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  outline: none;
  color: var(--el-text-color-primary, #333);
  line-height: normal;
}

.header-right .el-dropdown {
  display: flex;
  align-items: center;
  margin-left: 30px;
}

.username {
  font-size: 14px;
}

.drawer-bg {
  background: #000;
  opacity: 0.3;
  width: 100%;
  top: 0;
  height: 100%;
  position: absolute;
  z-index: 999;
}

.logo-horizontal {
  font-size: 18px;
  font-weight: bold;
  color: var(--el-text-color-primary, #333);
  margin-right: 20px;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .hidden-xs-only {
    display: none !important;
  }
  
  .aside-container {
    transition: width 0.3s;
  }
}

.horizontal-header {
  background-color: #273352;
  color: #fff;
  border-bottom: none;
}

.is-horizontal .logo-horizontal,
.is-mix .logo-horizontal {
  color: #fff;
  min-width: 140px;
}

.is-horizontal .header-right,
.is-mix .header-right {
  color: #fff;
}

.is-horizontal .header-right .action-item,
.is-horizontal .header-right .user-info,
.is-mix .header-right .action-item,
.is-mix .header-right .user-info {
  color: #fff;
}

.is-horizontal .header-right .user-info .el-icon,
.is-mix .header-right .user-info .el-icon {
  color: #fff;
}

.is-horizontal .el-menu-item.is-active,
.is-mix .el-menu-item.is-active {
  background-color: #001529 !important;
}
</style>
