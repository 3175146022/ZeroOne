<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <template #header>
            <div class="card-header">
              <span>访问量</span>
              <el-tag type="success">日</el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="data-value">12,345</div>
            <div class="data-desc">日同比 12.5% <el-icon color="red"><CaretTop /></el-icon></div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <template #header>
            <div class="card-header">
              <span>用户数</span>
              <el-tag type="primary">月</el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="data-value">1,234</div>
            <div class="data-desc">月同比 5.3% <el-icon color="red"><CaretTop /></el-icon></div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <template #header>
            <div class="card-header">
              <span>收入</span>
              <el-tag type="warning">年</el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="data-value">¥ 123,456</div>
            <div class="data-desc">年同比 -2.1% <el-icon color="green"><CaretBottom /></el-icon></div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <template #header>
            <div class="card-header">
              <span>订单</span>
              <el-tag type="danger">周</el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="data-value">890</div>
            <div class="data-desc">周同比 15.8% <el-icon color="red"><CaretTop /></el-icon></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>流量趋势</span>
            </div>
          </template>
          <div style="height: 350px; display: flex; align-items: center; justify-content: center; background: #f5f7fa; color: #909399;">
            图表区域 (ECharts Placeholder)
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>系统公告</span>
              <el-link type="primary">更多</el-link>
            </div>
          </template>
          <div style="height: 350px;">
            <div v-for="i in 5" :key="i" class="notice-item">
              <el-tag size="small" style="margin-right: 10px;">公告</el-tag>
              <span class="notice-title">ZeroOne 后台管理系统 {{ i }}.0 版本发布</span>
              <span class="notice-date">2026-01-{{ 20 - i }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { CaretTop, CaretBottom } from '@element-plus/icons-vue'
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.data-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.data-desc {
  font-size: 12px;
  color: #909399;
  display: flex;
  align-items: center;
  gap: 5px;
}

.notice-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  font-size: 14px;
  cursor: pointer;
}

.notice-item:hover .notice-title {
  color: #409EFF;
}

.notice-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notice-date {
  color: #909399;
  font-size: 12px;
  margin-left: 10px;
}
</style>
