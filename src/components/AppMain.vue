<template>
  <div class="app-main-container">
    <!-- Tags View -->
    <div class="tags-view-container" v-if="!hideTagsView">
      <el-scrollbar>
        <div class="tags-view-wrapper">
          <el-tag
            v-for="tag in tagsList"
            :key="tag.path"
            :closable="!isAffix(tag)"
            :type="isActive(tag) ? 'primary' : 'info'"
            :effect="isActive(tag) ? 'dark' : 'plain'"
            class="tags-view-item"
            :class="tagsStyle"
            @click="handleTagClick(tag)"
            @close="handleTagClose(tag)"
            @contextmenu.prevent="openContextMenu($event, tag)"
          >
            {{ tag.title }}
          </el-tag>
        </div>
      </el-scrollbar>
      
      <!-- Context Menu -->
      <ul v-show="contextMenuVisible" :style="{ left: contextMenuLeft + 'px', top: contextMenuTop + 'px' }" class="context-menu">
        <li v-if="!isAffix(selectedTag)" @click="closeSelectedTag(selectedTag)">关闭当前</li>
        <li @click="closeOtherTags">关闭其他</li>
        <li @click="closeAllTags">关闭所有</li>
      </ul>
    </div>

    <el-main>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </el-main>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const props = defineProps({
  hideTagsView: {
    type: Boolean,
    default: false
  },
  tagsStyle: {
    type: String,
    default: 'smart'
  }
})

const route = useRoute()
const router = useRouter()
const tagsList = ref([])

// Context Menu State
const contextMenuVisible = ref(false)
const contextMenuLeft = ref(0)
const contextMenuTop = ref(0)
const selectedTag = ref({})

const isAffix = (tag) => {
  return tag.path === '/dashboard'
}

const isActive = (tag) => {
  return tag.path === route.path
}

const openContextMenu = (e, tag) => {
  contextMenuVisible.value = true
  selectedTag.value = tag
  contextMenuLeft.value = e.clientX
  contextMenuTop.value = e.clientY
}

const closeContextMenu = () => {
  contextMenuVisible.value = false
}

const closeSelectedTag = (tag) => {
  handleTagClose(tag)
  closeContextMenu()
}

const closeOtherTags = () => {
  tagsList.value = tagsList.value.filter(tag => tag.path === selectedTag.value.path || isAffix(tag))
  router.push(selectedTag.value.path)
  closeContextMenu()
}

const closeAllTags = () => {
  tagsList.value = tagsList.value.filter(tag => isAffix(tag))
  router.push(tagsList.value[tagsList.value.length - 1].path)
  closeContextMenu()
}

watch(contextMenuVisible, (value) => {
  if (value) {
    document.body.addEventListener('click', closeContextMenu)
  } else {
    document.body.removeEventListener('click', closeContextMenu)
  }
})

const handleTagClick = (tag) => {
  router.push(tag.path)
}

const handleTagClose = (tag) => {
  const index = tagsList.value.findIndex(item => item.path === tag.path)
  tagsList.value.splice(index, 1)
  
  if (isActive(tag)) {
    const nextTag = tagsList.value[index] || tagsList.value[index - 1]
    if (nextTag) {
      router.push(nextTag.path)
    } else {
      router.push('/')
    }
  }
}

const initTags = () => {
  const dashboardTag = {
    title: '首页',
    path: '/dashboard',
    fullPath: '/dashboard',
    meta: { title: '首页', icon: 'DataLine' }
  }
  
  // 总是添加仪表盘
  if (!tagsList.value.some(tag => tag.path === '/dashboard')) {
    tagsList.value.push(dashboardTag)
  }
}

watch(
  () => route.path,
  () => {
    initTags()
    if (route.meta && route.meta.title) {
      const exist = tagsList.value.some(item => item.path === route.path)
      if (!exist) {
        tagsList.value.push({
          title: route.meta.title,
          path: route.path,
          fullPath: route.fullPath
        })
      }
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.app-main-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  height: 100%;
  width: 100%;
}

.app-content {
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;
  padding: 0;
}

.tags-view-container {
  height: 34px;
  width: 100%;
  background: var(--el-bg-color, #fff);
  border-bottom: 1px solid var(--el-border-color, #d8dce5);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, .12), 0 0 3px 0 rgba(0, 0, 0, .04);
}

.context-menu {
  margin: 0;
  background: #fff;
  z-index: 3000;
  position: fixed;
  list-style-type: none;
  padding: 5px 0;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 400;
  color: #333;
  box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, .3);
}

.context-menu li {
  margin: 0;
  padding: 7px 16px;
  cursor: pointer;
}

.context-menu li:hover {
  background: #eee;
}

.tags-view-wrapper {
  display: flex;
  align-items: center;
  height: 34px;
  padding: 0 10px;
}

.tags-view-item {
  margin-right: 5px;
  cursor: pointer;
}

.tags-view-item.smart {
  border-radius: 4px;
}

.tags-view-item.card {
  border-radius: 0;
  border: 1px solid #d8dce5;
}

.tags-view-item:last-of-type {
  margin-right: 15px;
}

.tags-view-wrapper {
  display: flex;
  align-items: center;
  height: 34px;
  padding: 0 10px;
}

.tags-view-item {
  margin-right: 5px;
  cursor: pointer;
}

.tags-view-item.smart {
  border-radius: 4px;
}

.tags-view-item.card {
  border-radius: 0;
  border: 1px solid #d8dce5;
}

.tags-view-item:last-of-type {
  margin-right: 15px;
}

.el-main {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
  background-color: var(--el-bg-color-page, #f0f2f5);
}

/* 动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
