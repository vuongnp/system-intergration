import Vue from 'vue'
import Router from 'vue-router'
import PrivateLayout from '@/layouts/PrivateLayout'
// import Chat from '@/pages/container/Chat'
import Signin from '@/pages/Signin'
import AllGroup from '@/pages/AllGroup';
import Notice from '@/pages/Notice';
import Group from '@/pages/Group';
import Signup from '@/pages/Signup'
import File from '@/pages/File'
import Meeting from '@/pages/Meeting'
import ListGroupExercise from '@/pages/ListGroupExercise'
import Exercise from '@/pages/Exercise'
import Attendance from '@/pages/Attendance'

import Error404 from '@/pages/Error404'
// import ExStudent from '@/pages/container/ExStudent'
// import ExAdmin from '@/pages/container/ExAdmin'
// import Error from '@/pages/container/Error'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      component: PrivateLayout,
      redirect: "/all-group",
        // beforeEnter: (to, from, next) => {
        //   if (localStorage.token && localStorage.username)
        //     return next();
        //   else
        //     next('/signin')
        // },
      children:
        [
          //   {
          //     path: 'chat',
          //     name: 'chat',
          //     component: Chat
          //   },
          {
            path: 'all-group',
            name: 'allGroup',
            component: AllGroup
          },

          {
            path: 'file',
            name: 'file',
            component: File
          },
          {
            path: 'notification',
            name: 'notification',
            component: Notice
          },
          {
            path: 'group/:id',
            name: 'group',
            component: Group
          },
          {
            path: 'group-exercise',
            name: 'exercise',
            component: ListGroupExercise
          },
          {
            path: 'meeting/:id',
            name: 'meeting',
            component: Meeting
          },
          {
            path: 'exercise/:id',
            name: 'Exercise',
            component: Exercise
          },
          {
            path: 'attendance/:id',
            name: 'attendance',
            component: Attendance
          },
          //   {
          //     path: 'exAdmin/:id',
          //     name: 'Manage',
          //     component: ExAdmin
          //   },
        ]
    },

    {
      path: '/signin',
      name: 'signin',
      component: Signin,
      beforeEnter: (to, from, next) => {
        if (!localStorage.token || !localStorage.username)
          return next();
        else
          next('/')
      },
    },
    {
      path: '/signup',
      name: 'signup',
      component: Signup
      ,
      beforeEnter: (to, from, next) => {
        if (!localStorage.token || !localStorage.username)
          return next();
        else
          next('/')
      },
    },
    {
      path: '*',
      name: 'error',
      component: Error404
    },
  ],
})
router.beforeEach((to, from, next) => {
  if (to.fullPath !== "/signin" && to.fullPath !== '/signup')
    if (localStorage.token && localStorage.username)
      return next();
    else
      return next('/signin')
    else
    return next()
})
// router.beforeEach((to, from, next) => {
//   switch (to.fullPath) {
//     case '/signin':
//       {
//         if (localStorage.token != undefined)
//           next('/')
//         else
//           next();
//         break;
//       };
//     case '/signup':
//       {
//         if (localStorage.token != undefined) {
//           alert('vui lòng đăng xuất trước');
//           next('/')
//         }
//         else
//           next();
//         break;
//       };
//     default: {
//       if (localStorage.token != undefined)
//         next()
//       else
//         next('/signin')
//       break;
//     }
//   }
// })
export default router;