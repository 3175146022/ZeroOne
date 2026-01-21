import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '../components/AdminLayout.vue'
import { useUserStore } from '../stores/user'

const modules = import.meta.glob('../views/**/*.vue')

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/index.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: AdminLayout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/dashboard/index.vue'),
        meta: { title: '首页', icon: 'DataLine' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export const loadView = (view) => {
  let res;
  for (const path in modules) {
    const dir = path.split('views/')[1].split('.vue')[0];
    if (dir === view) {
      res = modules[path];
    }
  }
  return res;
}

router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else if (token && to.path !== '/login') {
    const userStore = useUserStore()
    if (!userStore.isRoutesLoaded) {
      try {
        await userStore.getInfo()
        const accessRoutes = await userStore.getRouters()
        
        accessRoutes.forEach(route => {
          const routeRecord = {
              path: route.path,
              component: (route.component === "" || route.component === "Layout") ? AdminLayout : loadView(route.component),
              name: route.name,
              meta: route.meta,
              children: []
          }
          
          if (route.children) {
              routeRecord.children = route.children.map(child => {
                  return {
                      path: child.path,
                      name: child.name,
                      component: loadView(child.component),
                      meta: child.meta
                  }
              })
          }
          router.addRoute(routeRecord)
        })
        
        next({ ...to, replace: true })
      } catch (error) {
        console.error(error)
        userStore.logout()
        next('/login')
      }
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
