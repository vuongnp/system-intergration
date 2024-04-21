 
<template>
  <div>
    <chat-meeting :roomId="roomId" />
    <div class="post-header">
      <div class="title">Posts</div>
      <div class="">
        <a-button type="primary" icon="video-camera" @click="goToMeetingPage"
          >Join</a-button
        >
        <span> <a-icon class="action-post-icon setting" type="setting" /></span>
      </div>
    </div>
    <div class="list-post" ref="listPostPane">
      <a-list
        item-layout="vertical"
        size="large"
        class="list-notice"
        style="padding: 10px; border-radius: 5px"
        :data-source="listData"
      >
        <a-list-item slot="renderItem" key="item.title" slot-scope="item">
          <post-item :item="item" :listData="listData" />
          <post-comment :item="item" :group_id="roomId" :socket="socketPost" />
          <!-- <div class="list-item-footer">
            <div>
              <input placeholder="Nhập câu trả lời" />
              <div class="function-btn">
                <a-icon type="enter" />
                Trả lời
              </div>
            </div>
          </div> -->
        </a-list-item>
      </a-list>
    </div>
    <post-form-submit :socket="socketPost" />
  </div>
</template>
<script>
import { mapState } from "vuex";
import PostFormSubmit from "./Group/PostFormSubmit.vue";
import PostItem from "./Group/PostItem.vue";
import PostComment from "./Group/PostComment.vue";
import { generateHeader } from "../services/api";
import ChatMeeting from "./Meeting/ChatMeeting.vue";
import io from "socket.io-client";
// let socket = io.connect(process.env.VUE_APP_HOST_WS_POST, {
//   query: generateHeader(),
// });
export default {
  components: { ChatMeeting, PostItem, PostFormSubmit, PostComment },
  data() {
    return {
      roomId: this.$route.params.id,
      fileSend: null,
      uploading: false,
      loading: false,
      loadingMore: false,
      content: "",
      showLoadingMore: true,
      socketPost: null,
    };
  },
  beforeDestroy() {
    this.socketPost.disconnect();
  },
  watch: {
    listData: {
      handler: function () {
        this.$nextTick(function () {
          this.$refs.listPostPane.scrollTop = this.$refs.listPostPane.scrollHeight;
        });
      },
    },
  },
  computed: {
    ...mapState({
      listData: (state) => state.post.listData,
    }),
  },
  created() {
    this.socketPost = io.connect(process.env.VUE_APP_HOST_WS_POST, {
      query: generateHeader(),
    });
    this.socketPost.emit("join-room", this.roomId);
       this.socketPost.on("have-error", () => {
      this.$router.push('/')
    });
    this.socketPost.on("get-all-post", (data) => {
      this.$store.commit("post/setListData", data);
    });
    this.socketPost.on("new-post", (data) => {
      this.$store.commit("post/addNewPost", data);
    });
    this.socketPost.on("new-comment", (data) => {
      this.$store.commit("post/addNewComment", data);
    });
    this.$store.commit("post/setSelectedGroupId", this.roomId);
    // this.$store.dispatch("post/fetchAllData");
  },
  methods: {
    goToMeetingPage() {
      this.$router.push("/attendance/"+this.roomId);
      // this.$router.push("/meeting/" + this.roomId);
    },
  },
};
</script>

<style scoped>
.setting {
  margin-left: 20px;
}
.post-form {
  position: absolute;
  background: rgb(243, 242, 241);
  bottom: 0;
  width: calc(100% - 300px);
  padding: 16px 48px 8px 78px;
}
input,
textarea {
  position: relative;
  width: 100%;
  padding: 8px 16px 8px 16px;
  border: none;
  outline: none;
  border-bottom: 2px solid #1890ff;
  border-top: 1px solid #e8e8e8;
}
.title {
  font-size: 18px;
  font-weight: 500;
}
.post-header {
  position: absolute;
  display: flex;
  justify-content: space-between;
  z-index: 555;
  padding: 16px 32px 16px 32px;
  width: calc(100% - 300px);
  top: 0;
  background: #fff;
}

p {
  margin-bottom: 2px;
}

.list-item-footer {
  margin-left: 48px;
}
.ant-list-vertical .ant-list-item-action {
  margin-top: 0 !important;
}
.ant-input {
  border: none;
  border-width: 0;
  box-shadow: none;
}
.flex {
  display: flex;
}
.list-post {
  height: 100vh;
  overflow-y: auto;
  padding: 50px 36px 100px 20px;
  width: calc(100% - 300px);
}
</style>