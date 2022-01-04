import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Image from '../views/Image.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/images',
    name: 'Image',
    component: Image
  },
  {
    path: '/episode/:id',
    name: 'episode',
    component: () => import('../views/Episode.vue')
  },
  {
    path: '/lowerthird/:id',
    name: 'lowerthird',
    component: () => import('../views/LowerThird.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
