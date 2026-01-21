<template>
  <div class="app-container">
    <el-row :gutter="10" style="margin-bottom: 20px;">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="permissions.create"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="Sort"
          @click="toggleExpandAll"
        >展开/折叠</el-button>
      </el-col>
    </el-row>

    <el-table
      v-if="refreshTable"
      v-loading="loading"
      :data="menuList"
      row-key="id"
      :default-expand-all="isExpandAll"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <el-table-column prop="name" label="菜单名称" :show-overflow-tooltip="true" width="160"></el-table-column>
      <el-table-column prop="icon" label="图标" align="center" width="100">
        <template #default="scope">
           <component
              v-if="scope.row.icon"
              :is="scope.row.icon"
              style="width: 16px; height: 16px; vertical-align: middle;"
            />
        </template>
      </el-table-column>
      <el-table-column prop="weight" label="排序" width="60"></el-table-column>
      <el-table-column prop="perm" label="权限标识" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="component" label="组件路径" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="status" label="状态" width="80">
        <template #default="scope">
          <el-tag v-if="scope.row.status === 1" type="success">正常</el-tag>
          <el-tag v-else type="info">隐藏</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="permissions.update">修改</el-button>
          <el-button link type="primary" icon="Plus" @click="handleAdd(scope.row)" v-hasPermi="permissions.create">新增</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="permissions.delete">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改菜单对话框 -->
    <el-dialog :title="title" v-model="open" width="680px" append-to-body>
      <el-form ref="menuRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="上级菜单">
              <el-tree-select
                v-model="form.pid"
                :data="menuOptions"
                :props="{ value: 'value', label: 'label', children: 'children' }"
                value-key="value"
                placeholder="选择上级菜单"
                check-strictly
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="菜单类型" prop="type">
              <el-radio-group v-model="form.type">
                <el-radio :label="1">目录</el-radio>
                <el-radio :label="2">菜单</el-radio>
                <el-radio :label="3">按钮</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="form.type !== 3">
            <el-form-item label="菜单图标" prop="icon">
              <el-popover
                ref="popoverRef"
                placement="bottom-start"
                :width="540"
                trigger="click"
                v-model:visible="showChooseIcon"
              >
                <template #reference>
                  <el-input v-model="form.icon" placeholder="点击选择图标" readonly>
                    <template #prefix>
                      <el-icon v-if="form.icon" class="el-input__icon">
                        <component :is="form.icon" />
                      </el-icon>
                      <el-icon v-else class="el-input__icon"><Search /></el-icon>
                    </template>
                  </el-input>
                </template>
                <IconSelect @selected="selected" :active-icon="form.icon" />
              </el-popover>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="菜单名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入菜单名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="weight">
              <el-input-number v-model="form.weight" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.type !== 3">
            <el-form-item label="路由地址" prop="route_path">
              <el-input v-model="form.route_path" placeholder="请输入路由地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.type === 2">
            <el-form-item label="路由名称" prop="route_name">
              <el-input v-model="form.route_name" placeholder="请输入路由名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.type === 2">
            <el-form-item label="组件路径" prop="component">
              <el-input v-model="form.component" placeholder="请输入组件路径" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.type === 3">
            <el-form-item label="权限字符" prop="perm">
              <el-input v-model="form.perm" placeholder="请输入权限字符" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.type === 2">
            <el-form-item label="是否缓存" prop="keep_alive">
              <el-radio-group v-model="form.keep_alive">
                <el-radio :label="1">缓存</el-radio>
                <el-radio :label="2">不缓存</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.type !== 3">
            <el-form-item label="显示状态" prop="always_show">
              <el-radio-group v-model="form.always_show">
                <el-radio :label="1">显示</el-radio>
                <el-radio :label="2">隐藏</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="菜单状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio :label="1">正常</el-radio>
                <el-radio :label="2">隐藏</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.type !== 3">
            <el-form-item label="跳转地址" prop="redirect">
              <el-input v-model="form.redirect" placeholder="请输入跳转地址" />
            </el-form-item>
          </el-col>
        </el-row>
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
import { ref, reactive, toRefs, nextTick, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listMenu, getMenu, delMenu, addMenu, updateMenu, getMenuSelect } from '@/api/system/menu'
import IconSelect from '@/components/IconSelect/index.vue'
import { Search } from '@element-plus/icons-vue'

const loading = ref(true)
const title = ref("")
const open = ref(false)
const showChooseIcon = ref(false)
const popoverRef = ref(null)
const isExpandAll = ref(false)
const refreshTable = ref(true)
const menuList = ref([])
const menuOptions = ref([])
const menuRef = ref(null)

// 权限配置
const permissions = {
  create: 'permission:rule:create',
  update: 'permission:rule:update',
  delete: 'permission:rule:delete'
}

const data = reactive({
  form: {},
  queryParams: {
    name: undefined,
    status: undefined
  },
  rules: {
    name: [{ required: true, message: "菜单名称不能为空", trigger: "blur" }],
    weight: [{ required: true, message: "菜单顺序不能为空", trigger: "blur" }],
    route_path: [{ required: true, message: "路由地址不能为空", trigger: "blur" }],
    route_name: [{ required: true, message: "路由名称不能为空", trigger: "blur" }],
    component: [{ required: true, message: "组件路径不能为空", trigger: "blur" }],
    perm: [{ required: true, message: "权限字符不能为空", trigger: "blur" }]
  }
})

const { form, rules } = toRefs(data)

/** 查询菜单列表 */
function handleQuery() {
  loading.value = true
  listMenu().then(response => {
    menuList.value = response.data
    loading.value = false
  })
}

/** 展开/折叠操作 */
function toggleExpandAll() {
  refreshTable.value = false
  isExpandAll.value = !isExpandAll.value
  nextTick(() => {
    refreshTable.value = true
  })
}

/** 新增按钮操作 */
function handleAdd(row) {
  reset()
  getTreeSelect()
  if (row != null && row.id) {
    form.value.pid = row.id
  } else {
    form.value.pid = 0
  }
  open.value = true
  title.value = "添加菜单"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  getTreeSelect()
  getMenu(row.id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改菜单"
  })
}

/** 提交按钮 */
function submitForm() {
  menuRef.value.validate(valid => {
    if (valid) {
      if (form.value.id != undefined) {
        updateMenu(form.value).then(response => {
          ElMessage.success("修改成功")
          open.value = false
          handleQuery()
        })
      } else {
        addMenu(form.value).then(response => {
          ElMessage.success("新增成功")
          open.value = false
          handleQuery()
        })
      }
    }
  })
}

/** 选中图标 */
function selected(name) {
  form.value.icon = name
  showChooseIcon.value = false
  popoverRef.value.hide()
}

/** 删除按钮操作 */
function handleDelete(row) {
  ElMessageBox.confirm('是否确认删除名称为"' + row.name + '"的数据项?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return delMenu(row.id)
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
  form.value = {
    id: undefined,
    pid: 0,
    name: undefined,
    icon: undefined,
    type: 1,
    weight: 0,
    route_path: undefined,
    route_name: undefined,
    component: undefined,
    perm: undefined,
    keep_alive: 1,
    always_show: 1,
    status: 1,
    redirect: undefined
  }
}

/** 查询菜单下拉树结构 */
function getTreeSelect() {
  getMenuSelect().then(response => {
    const menu = { value: 0, label: '顶级菜单', children: [] }
    menu.children = response.data
    menuOptions.value = [menu]
  })
}

onMounted(() => {
  handleQuery()
})
</script>
