<template>
  <div class="task-manager" :style="{ right: activeTab ? '150px' : '0' }">
    <div class="meeting-function-view">
      <unicon name="record-audio" fill="green"></unicon>
    </div>
    <div
      :class="{
        'meeting-function-button': true,
        active: camera,
      }"
      @click="() => turnOnDevice(true, false)"
    >
      <unicon
        :name="camera ? 'video' : 'video-slash'"
        fill="rgba(0, 0, 0, 0.65)"
      ></unicon>
    </div>
    <div
      :class="{
        'meeting-function-button': true,
        active: microphone,
      }"
      @click="() => turnOnDevice(false, true)"
    >
      <unicon
        :name="microphone ? 'microphone' : 'microphone-slash'"
        fill="rgba(0, 0, 0, 0.65)"
      ></unicon>
    </div>
    <div :class="dataSharing? 'meeting-function-view':'meeting-function-button'" @click="handleShareScreen">
      <unicon
        :name="dataSharing ? 'desktop-slash' : 'desktop'"
        :fill="dataSharing ?'rgba(0, 0, 0, 0.2)':'rgba(0, 0, 0, 0.65)'"
      ></unicon>
    </div>
    <div
      :class="{
        'meeting-function-button': true,
        active: activeTab === 'CHAT_TAB',
      }"
      @click="(e) => changeCurrentTab('CHAT_TAB')"
    >
      <unicon name="comments-alt" fill="rgba(0, 0, 0, 0.65)"></unicon>
    </div>
    <div
      :class="{
        'meeting-function-button': true,
        active: activeTab === 'LIST_USER',
      }"
      @click="(e) => changeCurrentTab('LIST_USER')"
    >
      <unicon name="users-alt" fill="rgba(0, 0, 0, 0.65)"></unicon>
    </div>
    <div
      class="meeting-function-button"
      style="background: red"
      @click="() => showLog()"
    >
      <unicon name="phone" fill="white"></unicon>
    </div>
    <div v-if="isShow" class="log_attendance">
      <div class="log-title">
        Participants
      </div>
      <div class="main_log_attendance">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(user,i) in users" :key="i">
              <td scope="row">{{parseInt(i)+1}}</td>  
              <td>{{ user.username }}</td> 
              <td>{{ formatTime(user.timestamp) }}</td>  
            </tr>
          </tbody>
        </table>
      </div>
      <button @click="() => handleOKLog()" class="ok-log-btn">Confirm</button>  
    </div>
    <div></div>
  </div>
</template>
<script>
import { mapState } from "vuex";
import axios from "axios";
export default {
  props: ["roomId"],
  data() {
    return {
      activeTab: null,
      users: null,
      isShow: false
      // camera: false,
      // microphone: false,
    };
  },
  computed: {
    ...mapState({
      camera: (state) => state.meeting.mediaDevice.camera,
      microphone: (state) => state.meeting.mediaDevice.micro,
      isSharing: (state) => state.meeting.isSharing,
      dataSharing: (state) => state.meeting.dataSharing,
    }),
  },
  methods: {
    handleOKLog(){
      this.isShow=false;
      window.location.href = window.location.origin + "/";
    },
    showLog(){
      axios
        .get(`http://localhost:5050/get_log_attendance/${this.roomId}`)
        .then((response) => {
            // console.log(response);
            this.users = response.data.data;
            console.log(this.users);
            this.isShow = true;
        })
        .catch((error) => {
            console.error("There was an error!", error);
        });
    },
    formatTime(date) {
      const time = new Date(date);
      return (
        time.getHours().toString().padStart(2, "0") +
        ":" +
        time.getMinutes().toString().padStart(2, "0") +
        ":" +
        time.getSeconds().toString().padStart(2, "0") +
        " " +
        time.getDate() +
        "/" +
        parseInt(time.getMonth() + 1) +
        "/" +
        time.getFullYear()
      );
  },
    handleShareScreen() {
      if(!this.dataSharing)
        this.$store.commit("meeting/setShareScreen", !this.isSharing)
    },
    turnOnDevice(editCamera, editMicro) {
      if (editCamera)
        this.$store.commit("meeting/setMediaDevice", {
          camera: !this.$store.state.meeting.mediaDevice.camera,
          micro: this.$store.state.meeting.mediaDevice.micro,
        });
      if (editMicro)
        this.$store.commit("meeting/setMediaDevice", {
          camera: this.$store.state.meeting.mediaDevice.camera,
          micro: !this.$store.state.meeting.mediaDevice.micro,
        });
    },
    changeCurrentTab(tab) {
      if (this.activeTab === tab) this.activeTab = null;
      else this.activeTab = tab;
      this.$emit("show-right-tab", tab);
    },
  },
};
</script>
<style scoped>
.meeting-function-button {
  background: #fff;
  padding: 6px 24px;
  /* font-size: 16px; */
}
.meeting-function-view {
  background: #fff;
  padding: 6px 24px;
  /* font-size: 16px; */
}
.active {
  background: #ccc;
}
.meeting-function-button:hover {
  cursor: pointer;
  background: #ccc;
}

.task-manager {
  font-size: 25px;
  display: flex;
  justify-content: center;
  width: 100%;
  position: absolute;
  bottom: 200px;
  /* top: calc(100vh - 170px - 66px); */
  /* right: 150px; */
  z-index: 15;
}
.log_attendance{
  width: 40vw;
  position: absolute;
  top: -500px;
  z-index: 10;
  background-color: aliceblue;
}
.log-title{
  text-align: center;
    font-size: 30px;
    font-weight: bold;
    width: 100%;
    height: 60px;
    line-height: 60px;
}
.log_attendance .main_log_attendance{
  width: 96%;
  height: 30vh;
  overflow-y: scroll;
  margin-left: 2%;
}
.log_attendance table {
  width: 100%;
  border-collapse: collapse;
}
.log_attendance table, td, th {
border: 1px solid black;
}
.log_attendance th, td{
  text-align: center;
}
.log_attendance tbody tr{
  height: 50px;
}
.ok-log-btn{
    width: 20%;
    font-size: 25px;
    margin-left: 40%;
    margin-bottom: 25px;
    border-radius: 5px;
    background-color: aliceblue;
    cursor: pointer;
}
::-webkit-scrollbar {
  width: 5px;
}

/* Track */
::-webkit-scrollbar-track {
  box-shadow: inset 0 0 5px grey;
  border-radius: 10px;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: aliceblue;
  border-radius: 10px;
}
</style>