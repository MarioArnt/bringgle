import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import CreateList from '@/components/CreateList'
import JoinList from '@/components/JoinList'
import List from '@/components/List'
import RecoverSession from '@/components/RecoverSession'

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
    },
    {
      path: '/list/:id/join',
      component: JoinList
    },
    {
      path: '/list/:id/recovery',
      component: RecoverSession,
      props: (route) => ({
        userId: route.query.userId,
        listName: route.query.listName,
        userName: route.query.userName,
        email: route.query.email
      })
    }
  ]
})
