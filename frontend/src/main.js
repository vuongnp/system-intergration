import Vue from 'vue'
import App from './App.vue'
import router from "./router"
import 'ant-design-vue/dist/antd.css';
import rootStore from './store/rootStore';
import Antd from 'ant-design-vue';
import Unicon from 'vue-unicons'
import {
  uniRecordAudio,
  uniVideo, uniVideoSlash,
  uniMicrophone, uniMicrophoneSlash,
  uniDesktop, uniDesktopSlash,
  uniComments, uniUsersAlt, uniPhone,
  uniCommentsAlt, uniCornerUpLeftAlt
} from 'vue-unicons/src/icons'
import Noti from './utils/Noti';

Unicon.add([
  uniRecordAudio,
  uniVideo, uniVideoSlash,
  uniMicrophone, uniMicrophoneSlash,
  uniDesktop, uniDesktopSlash,
  uniComments, uniUsersAlt,
  uniCornerUpLeftAlt,
  uniPhone, uniCommentsAlt
  , uniUsersAlt
])


Vue.config.productionTip = false;
Vue.use(Unicon)
Vue.use(Antd)
Vue.prototype.$noti = new Noti(rootStore, Vue.prototype.$notification)

new Vue({
  render: h => h(App),
  router,
  store: rootStore
}).$mount('#app')
