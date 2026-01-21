<template>
  <div class="app-container">
    <el-card shadow="never" class="search-wrapper">
      <el-form :inline="true" :model="queryParams" ref="queryRef">
        <el-form-item label="操作人员" prop="username">
          <el-input
            v-model="queryParams.username"
            placeholder="请输入操作人员"
            clearable
            style="width: 240px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="操作标题" prop="title">
          <el-input
            v-model="queryParams.title"
            placeholder="请输入操作标题"
            clearable
            style="width: 240px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="IP地址" prop="ip">
          <el-input
            v-model="queryParams.ip"
            placeholder="请输入IP地址"
            clearable
            style="width: 240px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="table-wrapper">
      <el-table 
        v-loading="loading" 
        :data="oplogList" 
        style="width: 100%" 
        border
      >
        <el-table-column prop="id" label="日志编号" width="100" align="center" />
        <el-table-column prop="username" label="操作人员" width="120" align="center" />
        <el-table-column prop="title" label="操作标题" width="180" align="center" />
        <el-table-column prop="method" label="请求方式" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getMethodType(scope.row.method)">{{ scope.row.method }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="请求路径" :show-overflow-tooltip="true" />
        <el-table-column prop="ip" label="IP地址" width="140" align="center" />
        <el-table-column prop="created_at" label="操作日期" width="180" align="center" />
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template #default="scope">
            <el-button link type="primary" icon="View" @click="handleView(scope.row)" v-hasPermi="permissions.detail">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.per_page"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleQuery"
          @current-change="handleQuery"
        />
      </div>
    </el-card>

    <!-- 操作日志详细 -->
    <el-dialog title="操作日志详细" v-model="open" width="800px" append-to-body class="oplog-dialog">
      <el-form :model="form" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="操作人员：">{{ form.username }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="操作IP：">{{ form.ip }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="请求方式：">{{ form.method }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="操作时间：">{{ form.created_at }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="请求路径：">{{ form.path }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="浏览器：">{{ form.user_agent }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="请求参数：">
              <pre class="json-viewer">{{ formatJson(form.body) }}</pre>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="open = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, toRefs, onMounted } from 'vue'
import { listOplog, getOplog } from '@/api/system/oplog'

const loading = ref(true)
const total = ref(0)
const open = ref(false)
const oplogList = ref([])

const data = reactive({
  form: {},
  queryParams: {
    page: 1,
    per_page: 10,
    username: undefined,
    title: undefined,
    ip: undefined
  }
})

const { queryParams, form } = toRefs(data)

// 权限配置
const permissions = {
  detail: 'permission:oplog:detail'
}

/** 查询登录日志列表 */
function handleQuery() {
  loading.value = true
  listOplog(queryParams.value).then(response => {
    oplogList.value = response.data.list
    total.value = response.data.total
    loading.value = false
  })
}

/** 重置按钮操作 */
function resetQuery() {
  queryParams.value = {
    page: 1,
    per_page: 10,
    username: undefined,
    title: undefined,
    ip: undefined
  }
  handleQuery()
}

/** 详细按钮操作 */
function handleView(row) {
  open.value = true
  // 先显示列表中的数据，防止加载时的空白
  form.value = row
  getOplog(row.id).then(response => {
    // 合并详情数据，假设详情接口返回完整数据
    form.value = { ...form.value, ...response.data }
  })
}

/** 请求方式样式 */
function getMethodType(method) {
  if (method === 'GET') return 'success'
  if (method === 'POST') return 'primary'
  if (method === 'PUT') return 'warning'
  if (method === 'DELETE') return 'danger'
  return 'info'
}

/** 格式化JSON */
function formatJson(json) {
  if (!json) return ""
  try {
    return JSON.stringify(JSON.parse(json), null, 2)
  } catch (e) {
    return json
  }
}

onMounted(() => {
  handleQuery()
})
</script>

<style>
.oplog-dialog .el-dialog__body {
  max-height: 60vh;
  overflow-y: auto;
}
</style>

<style scoped>
.search-wrapper {
  margin-bottom: 20px;
}

.table-wrapper {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.json-viewer {
  background-color: #f4f4f5;
  padding: 10px;
  border-radius: 4px;
  font-family: monospace;
  white-space: pre-wrap;
  word-wrap: break-word;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
}
</style>
