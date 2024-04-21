<template>
  <div class="chat-body" id="message-box-list" ref="listChatMessage">
    <a-skeleton active v-if="spinning" />
    <div
      v-else-if="listMessage.length"
      v-for="(message, index) in listMessage"
      :key="index"
    >
      <div v-if="message.sender !== username" class="msg-pane receive-message">
        <div class="msg">
          <a-avatar
            class="receive-avatar"
            icon="user"
            :src="hostResoucre + '/user/' + message.sender + '.jpg'"
            style="margin-right: 4px"
          />
          <div class="msg-receive-container">
            <div v-if="message.type == 'data:image'" class="msg-content">
              <a
                :href="hostResoucre + message.content.split(':')[0]"
                target="_blank"
              >
                <img
                  :src="hostResoucre + message.content.split(':')[0]"
                  style="max-width: 160px"
                  alt
                />
              </a>
            </div>
            <div v-else class="msg-content">
              <a
                :href="hostResoucre + message.content.split(':')[0]"
                v-if="message.type != 'text'"
                target="_blank"
              >
                <a-icon type="file"></a-icon>
                {{ message.content.split(":")[1] | trimNameFile() }}
              </a>
              <p v-else>
                {{ message.content }}
              </p>
            </div>
            <div class="msg-time msg-receive-time">
              {{ message.time | shortTime }}
            </div>
          </div>
        </div>
      </div>
      <div v-else class="msg-pane">
        <div class="msg send-message">
          <div class="msg-send-container">
            <div v-if="message.type == 'data:image'" class="msg-content">
              <a
                :href="hostResoucre + message.content.split(':')[0]"
                target="_blank"
              >
                <img
                  :src="hostResoucre + message.content.split(':')[0]"
                  style="max-width: 160px"
                  alt
                />
              </a>
            </div>
            <div v-else class="msg-content">
              <a
                :href="hostResoucre + message.content.split(':')[0]"
                v-if="message.type != 'text'"
                target="_blank"
              >
                <a-icon type="file"></a-icon>
                {{ message.content.split(":")[1] | trimNameFile() }}
              </a>
              <p v-else>
                {{ message.content }}
              </p>
            </div>
            <div class="msg-time msg-send-time">
              {{ message.time | shortTime }}
            </div>
          </div>
          <a-avatar
            class="send-avatar"
            icon="user"
            :src="hostResoucre + '/user/' + message.sender + '.jpg'"
            style="margin-left: 4px"
          />
        </div>
      </div>
    </div>
    <a-empty v-else :image="simpleImage" />
  </div>
</template>
<script>
import moment from "moment";
import { TIME_FORMAT } from "../../../utils/constants";
import { trimNameFile } from "../../../utils/filters";
import { Empty } from "ant-design-vue";
export default {
  props: ["chatSocket", "username"],
  beforeCreate() {
    this.simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;
  },
  data() {
    return {
      hostResoucre: process.env.VUE_APP_HOST_RESOURCE,
      listMessage: [],
      page: 0,
      spinning: true,
    };
  },
  filters: {
    shortTime: (value) => {
      return moment(value).format(TIME_FORMAT.SHORT_FULL_TIME);
    },
    trimNameFile: trimNameFile,
  },
  watch: {
    listMessage: {
      handler: function (value) {
        this.$nextTick(function () {
          this.$refs.listChatMessage.scrollTop = this.$refs.listChatMessage.scrollHeight;
        });
      },
    },
  },
  mounted() {
    this.$refs.listChatMessage.scrollIntoView({ behavior: "smooth" });
  },
  created() {
    this.chatSocket.on("load-all-message", (data) => {
      var messageBox = document.getElementById("message-box-list");
      var tmp = messageBox.scrollHeight;
      this.spinning = false;
      if (data.length) {
        this.listMessage = data.concat(this.listMessage);

        // this.$nextTick(() => {
        //   this.$refs.listChatMessage.scrollTop = this.$refs.listChatMessage.scrollHeight;
        // });
        // if (this.page == 0)
        //   this.$nextTick(function () {
        //     messageBox.scrollTop = messageBox.scrollHeight;
        //   });
        // else
        //   this.$nextTick(function () {
        //     messageBox.scrollTop = messageBox.scrollHeight - tmp;
        //   });
      }
    });
    this.chatSocket.on("receive-message", (data) => {
      let len = this.listMessage.length;
      this.listMessage.push(data);
      if (len > 20) this.listMessage.unshift();
    });
  },
  methods: {},
};
</script>
<style  scoped>
.chat-body {
  overflow-y: scroll;
}
.msg-pane {
  padding: 8px 8px;
}
.msg {
  display: flex;
}
.ant-avatar {
  width: 32px;
  height: 32px;
}
.msg-content {
  max-width: 220px;
}
.msg-content > p {
  margin: 0;
}
.msg-time {
  font-size: 10px;
}
.msg-receive-container {
  padding: 5px 10px 5px 10px;
  border-radius: 5px;
  background: #fff;
}
.msg-send-time {
  float: right;
}
.msg-send-container {
  padding: 5px 10px 5px 10px;
  border-radius: 5px;
  background: #e5e5f1;
}
.send-message {
  justify-content: flex-end;
}
</style>