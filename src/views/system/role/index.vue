<template>
  <div class="app-container">
    <el-card shadow="never" class="search-wrapper">
      <el-form :inline="true" :model="queryParams" ref="queryRef">
        <el-form-item label="角色名称" prop="name">
          <el-input
            v-model="queryParams.name"
            placeholder="请输入角色名称"
            clearable
            style="width: 240px"
            @keyup.enter="handleQuery"
          />
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
        :data="roleList" 
        style="width: 100%" 
        @selection-change="handleSelectionChange"
        border
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="name" label="角色名称" align="center" />
        <el-table-column prop="pid" label="父级ID" align="center" width="100" />
        <el-table-column prop="status" label="状态" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 1" type="success">启用</el-tag>
            <el-tag v-else type="danger">禁用</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="scope">
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="permissions.update">修改</el-button>
            <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="permissions.delete">删除</el-button>
            <el-button link type="primary" icon="CircleCheck" v-hasPermi="permissions.update">数据权限</el-button>
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

    <!-- 添加或修改角色对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="roleRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="上级角色" prop="pid">
          <el-tree-select
            v-model="form.pid"
            :data="roleOptions"
            :props="{ value: 'value', label: 'label', children: 'children' }"
            value-key="value"
            placeholder="选择上级角色"
            check-strictly
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="2">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="角色权限">
          <el-form-item label-width="0">
            <el-checkbox v-model="menuExpand" @change="handleCheckedTreeExpand($event)">展开/折叠</el-checkbox>
            <el-checkbox v-model="menuNodeAll" @change="handleCheckedTreeNodeAll($event)">全选/全不选</el-checkbox>
          </el-form-item>
          <el-tree
            class="tree-border"
            :data="menuOptions"
            show-checkbox
            ref="menuRef"
            node-key="value"
            empty-text="加载中，请稍后"
            :props="{ label: 'label', children: 'children' }"
          ></el-tree>
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
import { ref, reactive, toRefs, onMounted, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listRole, getRole, delRole, addRole, updateRole, getRoleSelect, getRoleMenuIds } from '@/api/system/role'
import { getMenuSelect } from '@/api/system/menu'

const loading = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")
const open = ref(false)

// 权限配置
const permissions = {
  create: 'permission:group:create',
  update: 'permission:group:update',
  delete: 'permission:group:delete'
}

const data = reactive({
  form: {},
  queryParams: {
    page: 1,
    per_page: 10,
    name: undefined,
    status: undefined
  },
  rules: {
    name: [
      { required: true, message: "角色名称不能为空", trigger: "blur" }
    ]
  }
})

const { queryParams, form, rules } = toRefs(data)
const roleList = ref([])
const roleOptions = ref([])
const menuOptions = ref([])
const menuRef = ref(null)
const menuExpand = ref(false)
const menuNodeAll = ref(false)

/** 查询角色列表 */
function handleQuery() {
  loading.value = true
  listRole(queryParams.value).then(response => {
    roleList.value = response.data.list
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

/** 查询菜单下拉树结构 */
function getMenuOptions() {
  return getMenuSelect().then(response => {
    menuOptions.value = response.data
    return response.data
  })
}

/** 所有菜单节点数据 */
function getMenuAllCheckedKeys() {
  // 目前被选中的菜单节点
  let checkedKeys = menuRef.value.getCheckedKeys()
  // 半选中的菜单节点
  let halfCheckedKeys = menuRef.value.getHalfCheckedKeys()
  checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys)
  return checkedKeys.join(',')
}

/** 获取所有叶子节点 */
function getAllLeafKeys(treeData) {
  const keys = []
  const traverse = (nodes) => {
    nodes.forEach(node => {
      if (!node.children || node.children.length === 0) {
        keys.push(node.value)
      } else {
        traverse(node.children)
      }
    })
  }
  traverse(treeData)
  return keys
}

/** 树权限（展开/折叠）*/
function handleCheckedTreeExpand(value) {
  let treeList = menuOptions.value
  for (let i = 0; i < treeList.length; i++) {
    menuRef.value.store.nodesMap[treeList[i].value].expanded = value
  }
}

/** 树权限（全选/全不选） */
function handleCheckedTreeNodeAll(value) {
  menuRef.value.setCheckedNodes(value ? menuOptions.value : [])
}

/** 重置按钮操作 */
function resetQuery() {
  queryParams.value = {
    page: 1,
    per_page: 10,
    name: undefined,
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
  getMenuOptions()
  open.value = true
  title.value = "添加角色"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  getRoleOptions()
  const roleId = row.id || ids.value[0]
  const p1 = getMenuOptions()
  const p2 = getRole(roleId)
  const p3 = getRoleMenuIds(roleId)
  
  Promise.all([p1, p2, p3]).then(([menuData, response, menuIdsResponse]) => {
    form.value = response.data
    open.value = true
    title.value = "修改角色"
    nextTick(() => {
      const rules = menuIdsResponse.data
      const allCheckedKeys = Array.isArray(rules) ? rules : (rules ? rules.split(',') : [])
      const leafKeys = getAllLeafKeys(menuData)
      const checkedKeys = allCheckedKeys.filter(k => leafKeys.includes(k) || leafKeys.includes(Number(k)) || leafKeys.includes(String(k)))
      menuRef.value.setCheckedKeys(checkedKeys)
    })
  })
}

/** 提交按钮 */
function submitForm() {
  // roleRef.value.validate(valid => {
    // if (valid) {
      form.value.rules = getMenuAllCheckedKeys()
      if (form.value.id != undefined) {
        updateRole(form.value).then(response => {
          ElMessage.success("修改成功")
          open.value = false
          handleQuery()
        })
      } else {
        addRole(form.value).then(response => {
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
  const roleIds = row.id || ids.value
  ElMessageBox.confirm('是否确认删除角色ID为"' + roleIds + '"的数据项?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return delRole(roleIds)
    }).then(() => {
      handleQuery()
      ElMessage.success("删除成功")
    }).catch(() => {})
}


/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}

/** 表单重置 */
function reset() {
  if (menuRef.value != undefined) {
    menuRef.value.setCheckedKeys([])
  }
  menuExpand.value = false
  menuNodeAll.value = false
  form.value = {
    id: undefined,
    pid: 1,
    name: undefined,
    status: 1
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

.tree-border {
  margin-top: 5px;
  border: 1px solid #e5e6e7;
  background: #FFFFFF none;
  border-radius: 4px;
  width: 100%;
  height: 200px;
  overflow-y: auto;
}
</style>
