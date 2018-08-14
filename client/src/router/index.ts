import Vue from 'vue'
import Router from 'vue-router'

const Home = () => import('@/components/Home');
const CreateList = () => import('@/components/CreateList');
const JoinList = () => import('@/components/JoinList');
const List = () => import('@/components/List');
const RecoverSession = () => import('@/components/RecoverSession');
const ItemsList = () => import('@/components/ItemsList');
const Messenger = () => import('@/components/Messenger');
const ListHistory = () => import('@/components/History');

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
      component: List,
      children: [
        {
          path: 'items',
          component: ItemsList
        },
        {
          path: 'messages',
          component: Messenger
        },
        {
          path: 'history',
          component: ListHistory
        },
      ]
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
