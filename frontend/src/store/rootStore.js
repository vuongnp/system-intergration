
import Vue from 'vue'
import Vuex from 'vuex'

import authStore from './authStore'
import exerciseStore from './exerciseStore';
import groupStore from './groupStore';
import meetingStore from './meetingStore';
import notificaitonStore from './notificaitonStore';
import postStore from './postStore';
import userStore from './userStore'


Vue.use(Vuex);

const store = new Vuex.Store({
    modules: {
        user: userStore,
        auth: authStore,
        group: groupStore,
        meeting: meetingStore,
        noti: notificaitonStore,
        exercise: exerciseStore,
        post: postStore
    }
}) 

export default store;