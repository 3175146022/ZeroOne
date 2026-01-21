<template>
  <div class="icon-body">
    <el-input
      v-model="iconName"
      class="icon-search"
      clearable
      placeholder="请输入图标名称"
      @clear="filterIcons"
      @input="filterIcons"
    >
      <template #prefix>
        <el-icon class="el-input__icon"><Search /></el-icon>
      </template>
    </el-input>
    <div class="icon-list">
      <div v-for="(item, index) in iconList" :key="index" class="icon-item-wrapper" @click="selectedIcon(item)">
        <div class="icon-item" :class="{ 'is-active': activeIcon === item }">
          <el-icon>
            <component :is="item" />
          </el-icon>
          <span>{{ item }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { Search } from '@element-plus/icons-vue'

const props = defineProps({
  activeIcon: {
    type: String
  }
})

const emit = defineEmits(['selected'])
const iconName = ref('')
const allIcons = Object.keys(ElementPlusIconsVue)
const iconList = ref(allIcons)

function filterIcons() {
  if (iconName.value) {
    iconList.value = allIcons.filter(item => item.toLowerCase().includes(iconName.value.toLowerCase()))
  } else {
    iconList.value = allIcons
  }
}

function selectedIcon(name) {
  emit('selected', name)
}

function reset() {
  iconName.value = ''
  iconList.value = allIcons
}

defineExpose({
  reset
})
</script>

<style scoped>
.icon-body {
  width: 100%;
  padding: 10px;
}
.icon-search {
  margin-bottom: 10px;
}
.icon-list {
  height: 200px;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-wrap: wrap;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
}
.icon-item-wrapper {
  width: 20%; /* 每行5个 */
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 12px;
  color: #606266;
  transition: all 0.2s;
}
.icon-item:hover {
  background-color: #f5f7fa;
  color: #409eff;
}
.icon-item.is-active {
  color: #409eff;
  background-color: #ecf5ff;
}
.icon-item .el-icon {
  font-size: 20px;
  margin-bottom: 5px;
}
</style>
