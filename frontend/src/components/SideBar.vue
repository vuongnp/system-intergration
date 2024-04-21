<template>
  <a-layout-sider v-model="collapsed" collapsible>
    <div class="logo">
      <img src="logo.png" style="width: 30px" alt="" />
    </div>
    <a-menu theme="dark" mode="inline" :default-selected-keys="['3']">
      <a-menu-item key="1">
        <router-link :to="'/notification'">
          <a-badge v-show="haveNewNotice" class="dot-vip" dot></a-badge>
          <a-icon type="bell" />
          <span>Notifications</span>
        </router-link>
      </a-menu-item>
      <!-- <a-menu-item key="2">
        <router-link :to="'/meeting'">
          <a-icon type="wechat" />
          <span>Chat</span>
        </router-link>
      </a-menu-item> -->
      <a-menu-item key="3">
        <router-link :to="'/all-group'">
          <a-icon type="team" />
          <span>Groups</span>
        </router-link>
      </a-menu-item>
      <a-menu-item style="">
        <router-link :to="'/group-exercise'">
          <a-icon type="experiment" />
          <span>Assignments</span>
        </router-link>
      </a-menu-item>
    </a-menu>
    <div />
    <a-popover v-model="visible" trigger="click" placement="right">
      <div slot="content" @click="hide">
        <input
          type="file"
          style="display: none"
          ref="avatarUpload"
          accept="image/jpeg"
          @change="handleUploadAvatar"
        />
        <div>
          <a-button @click="handleClickUpload" icon="upload" type="button">
            Upload image
          </a-button>
        </div>
        <div style="margin-top: 16px; margin-left: 4px">
          <a @click="handleLogout">
            <a-icon type="logout" style="margin-right: 8px"></a-icon>Sign out</a
          >
        </div>
      </div>
      <div class="user-footer flex">
        <a-spin
          style="position: absolute; z-index: 2; width: 40px; padding-top: 10px"
          :spinning="loadingAvatar"
        >
          <a-icon
            slot="indicator"
            type="loading"
            style="font-size: 20px"
            spin
          />
        </a-spin>
        <a-avatar :size="40" icon="user" :src="srcAvatar" />
        <p v-if="!collapsed">
          {{ username }}
        </p>
      </div>
    </a-popover>
  </a-layout-sider>
</template>

<script>
import { mapState } from "vuex";
export default {
  // props: ["collapsed"],

  data() {
    return {
      hostResoucre: process.env.VUE_APP_HOST_RESOURCE,
      spinning: false,
      visible: false,
      collapsed: true,
      username: localStorage.username,
      srcAvatar: "",
    };
  },
  created() {
    this.srcAvatar = this.hostResoucre + "/user/" + this.username + ".jpg";
    this.$noti.socket.emit("get-status-notice");
    this.$noti.socket.on("res-status-notice", (data) => {});
    this.$noti.socket.on("read-all-notice", () => {
      this.$store.commit("noti/setHaveNewNotice", false);
    });
  },
  computed: {
    ...mapState({
      loadingAvatar: (state) => state.user.loading,
      haveNewNotice: (state) => state.noti.haveNewNotice,
    }),
  },
  methods: {
    handleUploadAvatar(e) {
      if (e.target.files[0]) {
        let reader = new FileReader();
        reader.onload = (e) => {
          this.srcAvatar = e.target.result;
        };
        reader.readAsDataURL(e.target.files[0]);
        this.$store.dispatch("user/changeAvatar", e.target.files[0]);
      }
    },
    handleClickUpload() {
      this.$refs.avatarUpload.click();
    },
    handleLogout() {
      localStorage.clear();
      window.location.reload();
    },
    hide() {
      this.visible = false;
    },
    // toggleCollapsed() {
    //   this.collapsed = !this.collapsed;
    // },
  },
};
</script>
<style scoped>
.user-footer {
  width: 100%;
  position: absolute;
  bottom: 50px;
  color: white;
  margin-left: 20px;
  margin-bottom: 4px;
}
.user-footer:hover {
  cursor: pointer;
}
.user-footer > p {
  line-height: 40px;
  margin-left: 16px;
  margin-bottom: 0;
}
.logo {
  display: flex;
  justify-content: center;
  background: transparent !important;
}
.dot-vip {
  position: absolute;
  top: 10px;
  left: 40px;
}
</style>
