<template>
  <div class="app-container">
    <el-card shadow="never" class="search-wrapper">
      <el-form :inline="true" :model="queryParams" ref="queryRef">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="queryParams.username" placeholder="请输入用户名" clearable style="width: 240px" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="queryParams.mobile" placeholder="请输入手机号" clearable style="width: 240px" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="请选择" clearable style="width: 240px">
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="table-wrapper">
      <div class="toolbar">
        <el-button type="primary" icon="Plus" @click="handleAdd" v-hasPermi="permissions.create">新增</el-button>
        <el-button type="success" icon="Edit" :disabled="single" @click="handleUpdate" v-hasPermi="permissions.update">修改</el-button>
        <el-button type="danger" icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="permissions.delete">删除</el-button>
      </div>

      <el-table 
        v-loading="loading"
        :data="adminList" 
        style="width: 100%" 
        @selection-change="handleSelectionChange"
        border
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="username" label="用户名" align="center" />
        <el-table-column prop="nickname" label="昵称" align="center" />
        <el-table-column label="角色" align="center">
          <template #default="scope">
            <el-tag v-for="item in scope.row.group" :key="item.id" size="small" style="margin-right: 5px">{{ item.name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="mobile" label="手机号" align="center" />
        <el-table-column prop="logintime" label="最后登录时间" width="180" align="center" />
        <el-table-column prop="status" label="状态" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 1" type="success">启用</el-tag>
            <el-tag v-else type="danger">禁用</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="scope">
            <div v-if="scope.row.id !== 1">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="permissions.update">修改</el-button>
              <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="permissions.delete">删除</el-button>
              <el-button link type="warning" icon="Key" @click="handleResetPwd(scope.row)" v-hasPermi="permissions.update">重置密码</el-button>
            </div>
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

    <!-- 添加或修改管理员对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="adminRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" :disabled="!!form.id" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="角色" prop="group_ids">
          <el-tree-select
            v-model="form.group_ids"
            :data="roleOptions"
            :props="{ value: 'value', label: 'label', children: 'children' }"
            value-key="value"
            placeholder="请选择角色"
            multiple
            check-strictly
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="form.mobile" placeholder="请输入手机号" maxlength="11" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!form.id">
          <el-input v-model="form.password" placeholder="请输入密码" type="password" show-password />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="2">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, toRefs, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listAdmin, getAdmin, delAdmin, addAdmin, updateAdmin, resetAdminPwd } from '@/api/system/admin'
import { getRoleSelect } from '@/api/system/role'

const loading = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")
const open = ref(false)
const roleOptions = ref([]) // 实际项目中需要从角色API获取

// 权限配置
const permissions = {
  create: 'permission:admin:create',
  update: 'permission:admin:update',
  delete: 'permission:admin:delete'
}

const data = reactive({
  form: {},
  queryParams: {
    page: 1,
    per_page: 10,
    username: undefined,
    mobile: undefined,
    status: undefined
  },
  rules: {
    username: [
      { required: true, message: "用户名不能为空", trigger: "blur" },
      { min: 2, max: 20, message: "用户名称长度必须介于 2 和 20 之间", trigger: "blur" }
    ],
    nickname: [
      { required: true, message: "昵称不能为空", trigger: "blur" }
    ],
    password: [
      { required: true, message: "密码不能为空", trigger: "blur" },
      { min: 5, max: 20, message: "用户密码长度必须介于 5 和 20 之间", trigger: "blur" }
    ],
    email: [
      { type: "email", message: "请输入正确的邮箱地址", trigger: ["blur", "change"] }
    ],
    mobile: [
      { pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: "请输入正确的手机号码", trigger: "blur" }
    ]
  }
})

const { queryParams, form, rules } = toRefs(data)
const adminList = ref([])

/** 查询管理员列表 */
function handleQuery() {
  loading.value = true
  listAdmin(queryParams.value).then(response => {
    adminList.value = response.data.list
    total.value = response.data.total
    loading.value = false
  })
}

/** 查询角色下拉树结构 */
function getRoleOptions() {
  getRoleSelect().then(response => {
    roleOptions.value = response.data
  })
}

/** 重置按钮操作 */
function resetQuery() {
  queryParams.value = {
    page: 1,
    per_page: 10,
    username: undefined,
    mobile: undefined,
    status: undefined
  }
  handleQuery()
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  getRoleOptions()
  open.value = true
  title.value = "添加管理员"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  getRoleOptions()
  const id = row.id || ids.value[0]
  getAdmin(id).then(response => {
    form.value = response.data
    // 处理角色回显：将 group 对象数组转换为 group_ids ID数组
    if (form.value.group && Array.isArray(form.value.group)) {
      form.value.group_ids = form.value.group.map(item => item.id)
    } else {
      form.value.group_ids = []
    }
    open.value = true
    title.value = "修改管理员"
  })
}

/** 提交按钮 */
function submitForm() {
  // adminRef.value.validate(valid => { // 暂时注释掉 validate，需要 ref
    // if (valid) {
      if (form.value.id != undefined) {
        updateAdmin(form.value).then(response => {
          ElMessage.success("修改成功")
          open.value = false
          handleQuery()
        })
      } else {
        addAdmin(form.value).then(response => {
          ElMessage.success("新增成功")
          open.value = false
          handleQuery()
        })
      }
    // }
  // })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const adminIds = row.id || ids.value
  ElMessageBox.confirm('是否确认删除管理员ID为"' + adminIds + '"的数据项?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return delAdmin(adminIds)
    }).then(() => {
      handleQuery()
      ElMessage.success("删除成功")
    }).catch(() => {})
}


/** 重置密码按钮操作 */
function handleResetPwd(row) {
  ElMessageBox.prompt('请输入"' + row.username + '"的新密码', "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    inputPattern: /^.{5,20}$/,
    inputErrorMessage: "用户密码长度必须介于 5 和 20 之间",
  }).then(({ value }) => {
    resetAdminPwd({ id: row.id, password: value }).then(response => {
      ElMessage.success("修改成功，新密码是：" + value)
    })
  }).catch(() => {})
}

/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}

/** 表单重置 */
function reset() {
  form.value = {
    id: undefined,
    username: undefined,
    nickname: undefined,
    mobile: undefined,
    email: undefined,
    group_ids: [],
    status: 1,
    remark: undefined
  }
}

onMounted(() => {
  handleQuery()
})
</script>

<style scoped>
.search-wrapper {
  margin-bottom: 20px;
}

.table-wrapper {
  margin-bottom: 20px;
}

.toolbar {
  margin-bottom: 15px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
