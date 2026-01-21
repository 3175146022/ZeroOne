<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <div class="logo">
          <img src="../../assets/vue.svg" alt="logo" />
          <span>ZeroOne System</span>
        </div>
        <p class="desc">基于 Vue 3 + Element Plus 的后台管理系统</p>
      </div>
      
      <el-form 
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        size="large"
      >
        <el-form-item prop="username">
          <el-input 
            v-model="loginForm.username" 
            placeholder="账号：admin"
            prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="密码：admin123"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-form-item prop="verifyCode">
          <div class="verify-code-container">
            <el-input 
              v-model="loginForm.verifyCode" 
              placeholder="请输入验证码"
              prefix-icon="Key"
              style="flex: 1; margin-right: 10px;"
              @keyup.enter="handleLogin"
            />
            <div class="verify-image" @click="refreshCode" title="点击刷新验证码">
              <img v-if="codeUrl" :src="codeUrl" alt="验证码" style="width: 100px; height: 40px; display: block;" />
            </div>
          </div>
        </el-form-item>
        <el-form-item>
          <div class="login-options">
            <el-checkbox v-model="loginForm.remember">记住密码</el-checkbox>
            <el-link type="primary" :underline="false">忘记密码？</el-link>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button 
            type="primary" 
            :loading="loading" 
            class="login-btn"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-footer">
        <p>演示账号：admin / admin123</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { User, Lock, Key } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getCodeImg } from '../../api/login'

const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref(null)
const loading = ref(false)
const codeUrl = ref('')
const uuid = ref('')

const loginForm = reactive({
  username: 'admin',
  password: 'admin888',
  verifyCode: '',
  remember: true,
  uuid: ''
})

const loginRules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  verifyCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

const getCode = () => {
  getCodeImg().then(res => {
    if (res.data) {
      codeUrl.value = res.data.image
      uuid.value = res.data.key
      loginForm.uuid = res.data.key
    }
  }).catch(error => {
    console.error('获取验证码失败:', error)
  })
}

const refreshCode = () => {
  getCode()
}

onMounted(() => {
  getCode()
})

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await userStore.login(loginForm.username, loginForm.password, loginForm.verifyCode, loginForm.uuid)
        ElMessage.success('登录成功')
        router.push('/')
      } catch (error) {
        console.error('登录失败:', error)
        refreshCode()
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-image: linear-gradient(to right, #74ebd5 0%, #9face6 100%);
  background-size: cover;
}

.login-box {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.logo img {
  width: 40px;
  height: 40px;
}

.logo span {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.desc {
  color: #999;
  font-size: 14px;
  margin: 0;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.login-btn {
  width: 100%;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
  color: #999;
  font-size: 12px;
}

.verify-code-container {
  display: flex;
  align-items: center;
  width: 100%;
}

.verify-image {
  cursor: pointer;
  height: 40px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #dcdfe6;
}
</style>
