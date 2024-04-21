import io from "socket.io-client";
import router from "../router";
import { generateHeader } from "../services/api";
import { Icon } from 'ant-design-vue';
export default class Noti {
  //Constructor to set the store reference, create socket io instance and initialize listeners.
  constructor(store, noti) {
    this.store = store;
    this.noti = noti;
    this.socket = io(process.env.VUE_APP_HOST_NOTI_WS, {
      query: generateHeader()
    });
    this.initListeners();
  }
  async initListeners() {
    this.socket.on('notification', (notice) => {
      this.noti.info({
        message: notice?.title,
        description: notice?.content,
        placement: "bottomRight",
        // icon: <Icon type="info" style="color: #108ee9" />,

        onClick: () => {
          this.socket.emit('read-notice', [notice.id]);
          if (notice.action)
            router.push(notice.action).catch(err => { });
        },
      });
      this.store.commit('noti/setHaveNewNotice', true);
    })
  }
}
