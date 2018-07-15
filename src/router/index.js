import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import CreateList from '@/components/CreateList'
import List from '@/components/List'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/create',
      name: 'Create',
      component: CreateList
    },
    {
      path: '/list/:id',
      component: List
    }
  ]
})
