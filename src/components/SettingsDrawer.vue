<template>
  <el-drawer
    v-model="visible"
    title="项目配置"
    size="350px"
    :with-header="true"
    append-to-body
  >
    <div class="drawer-container">
      <el-divider>导航栏模式</el-divider>
      <div class="drawer-item">
        <div class="nav-mode-container">
          <div 
            class="nav-mode-item" 
            :class="{ active: localSettings.navMode === 'vertical' }"
            @click="localSettings.navMode = 'vertical'"
          >
            <div class="mode-layout vertical">
              <div class="mode-aside" :style="{ backgroundColor: localSettings.themeColor }"></div>
              <div class="mode-main">
                <div class="mode-header"></div>
              </div>
            </div>
            <div class="mode-check" v-if="localSettings.navMode === 'vertical'">
              <el-icon><Check /></el-icon>
            </div>
          </div>
          <div 
            class="nav-mode-item" 
            :class="{ active: localSettings.navMode === 'horizontal' }"
            @click="localSettings.navMode = 'horizontal'"
          >
            <div class="mode-layout horizontal">
              <div class="mode-header" :style="{ backgroundColor: localSettings.themeColor }"></div>
              <div class="mode-main"></div>
            </div>
            <div class="mode-check" v-if="localSettings.navMode === 'horizontal'">
              <el-icon><Check /></el-icon>
            </div>
          </div>
          <div 
            class="nav-mode-item" 
            :class="{ active: localSettings.navMode === 'mix' }"
            @click="localSettings.navMode = 'mix'"
          >
            <div class="mode-layout mix">
              <div class="mode-header" :style="{ backgroundColor: localSettings.themeColor }"></div>
              <div class="mode-container">
                <div class="mode-aside" :style="{ backgroundColor: localSettings.themeColor }"></div>
                <div class="mode-main"></div>
              </div>
            </div>
            <div class="mode-check" v-if="localSettings.navMode === 'mix'">
              <el-icon><Check /></el-icon>
            </div>
          </div>
        </div>
      </div>

      <el-divider>主题色</el-divider>
      <div class="drawer-item">
        <div class="theme-color-container">
          <div
            v-for="color in themeColors"
            :key="color"
            class="color-item"
            :style="{ backgroundColor: color }"
            @click="localSettings.themeColor = color"
          >
            <el-icon v-if="localSettings.themeColor === color" color="#fff"><Check /></el-icon>
          </div>
        </div>
      </div>

      <el-divider>界面显示</el-divider>
      <div class="drawer-item">
        <span>灰色模式</span>
        <el-switch v-model="localSettings.grayMode" />
      </div>
      <div class="drawer-item">
        <span>色弱模式</span>
        <el-switch v-model="localSettings.weakMode" />
      </div>
      <div class="drawer-item">
        <span>隐藏标签页</span>
        <el-switch v-model="localSettings.hideTagsView" />
      </div>
      <div class="drawer-item">
        <span>侧边栏Logo</span>
        <el-switch v-model="localSettings.showLogo" />
      </div>
      <div class="drawer-item">
        <span>标签页持久化</span>
        <el-switch v-model="localSettings.tagsViewPersist" />
      </div>

      <div class="drawer-footer">
        <el-button type="danger" style="width: 100%" @click="resetSettings">
          <el-icon style="margin-right: 5px"><Refresh /></el-icon>
          清空缓存并返回登录页
        </el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { Check, Refresh } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  settings: {
    type: Object,
    default: () => ({
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
  }
})

const emit = defineEmits(['update:modelValue', 'update:settings'])

const visible = ref(false)
const localSettings = reactive({ ...props.settings })

const themeColors = [
  '#273352', '#409EFF', '#FA541C', '#FAAD14', '#13C2C2', '#52C41A', '#2F54EB', '#722ED1'
]

watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

watch(() => props.settings, (val) => {
  Object.assign(localSettings, val)
}, { deep: true })

watch(localSettings, (val) => {
  emit('update:settings', val)
}, { deep: true })

// Side effects
watch(() => localSettings.isDark, (val) => {
  const html = document.documentElement
  if (val) {
    html.classList.add('dark')
  } else {
    html.classList.remove('dark')
  }
}, { immediate: true })

watch(() => localSettings.grayMode, (val) => {
  const body = document.body
  if (val) {
    body.style.filter = 'grayscale(1)'
  } else {
    body.style.filter = ''
  }
}, { immediate: true })

watch(() => localSettings.weakMode, (val) => {
  const body = document.body
  if (val) {
    body.style.filter = 'invert(80%)'
  } else {
    body.style.filter = ''
  }
}, { immediate: true })

watch(() => localSettings.themeColor, (val) => {
  const el = document.documentElement
  el.style.setProperty('--el-color-primary', val)
}, { immediate: true })

const resetSettings = () => {
  localStorage.clear()
  window.location.reload()
}
</script>

<style scoped>
.drawer-container {
  padding: 20px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
}

.drawer-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  color: rgba(0, 0, 0, 0.65);
}

.theme-switch {
  display: flex;
  justify-content: center;
  width: 100%;
}

.nav-mode-container {
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 12px;
}

.nav-mode-item {
  position: relative;
  width: 80px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  background-color: #f0f2f5;
  box-shadow: 0 1px 2.5px 0 rgba(0, 0, 0, 0.18);
}

.nav-mode-item.active {
  border: 2px solid #409EFF;
}

.mode-layout {
  width: 100%;
  height: 100%;
  position: relative;
}

.mode-layout.vertical .mode-aside {
  width: 30%;
  height: 100%;
  background: #273352;
  position: absolute;
  left: 0;
  top: 0;
}

.mode-layout.vertical .mode-main {
  width: 70%;
  height: 100%;
  position: absolute;
  right: 0;
  top: 0;
}

.mode-layout.vertical .mode-header {
  width: 100%;
  height: 20%;
  background: #fff;
}

.mode-layout.horizontal .mode-header {
  width: 100%;
  height: 30%;
  background: #273352;
}

.mode-layout.horizontal .mode-main {
  width: 100%;
  height: 70%;
  background: #f0f2f5;
}

.mode-layout.mix .mode-header {
  width: 100%;
  height: 20%;
  background: #273352;
}

.mode-layout.mix .mode-container {
  width: 100%;
  height: 80%;
  display: flex;
}

.mode-layout.mix .mode-aside {
  width: 30%;
  height: 100%;
  background: #273352;
}

.mode-layout.mix .mode-main {
  width: 70%;
  height: 100%;
  background: #f0f2f5;
}

.mode-check {
  position: absolute;
  right: 10px;
  bottom: 10px;
  color: #409EFF;
}

.theme-color-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
}

.color-item {
  width: 20px;
  height: 20px;
  border-radius: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drawer-footer {
  margin-top: 40px;
}
</style>
