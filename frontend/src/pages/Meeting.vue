<template>
  <div>
    <chat-meeting
      :class="[tab === 'CHAT_TAB' ? 'chat-meeting' : 'chat-meeting-hide']"
      :roomId="roomId"
    />
    <list-member
      v-if="tab === 'LIST_USER'"
      :roomId="roomId"
    />
    <task-manager :roomId="roomId" @show-right-tab="(tab) => showTab(tab)" />
    <stream-screen
      :class="tab ? '.stream-screen' : '.stream-screen-full'"
      :roomId="roomId"
    />
  </div>
</template>
<script>
import ChatMeeting from "./Meeting/ChatMeeting.vue";
import StreamScreen from "./Meeting/StreamScreen.vue";
import TaskManager from "./Meeting/TaskManager.vue";
import ListMember from "./Meeting/ListMember.vue";

export default {
  components: { ChatMeeting, StreamScreen, TaskManager, ListMember },
  data() {
    return {
      tab: null,
      roomId: this.$route.params.id,
    };
  },

  methods: {
    showTab(tab) {
      if (this.tab === tab) this.tab = null;
      else this.tab = tab;
    },
  },
};
</script>
<style scoped>
.chat-bar {
  width: 300px;
  float: right;
  height: 100%;
  /* transition: width 1s; */
}
.chat-meeting {
  width: 300px;
}
.chat-meeting-hide {
  width: 0px;
}
.stream-screen-full {
  width: 100%;
  float: left;
}
.stream-screen {
  width: calc(100% - 300px);
  width: -webkit-calc(100% - 300px);
  width: -moz-calc(100% - 300px);
  width: -o-calc(100% - 300px);
  width: expression(100% - 300px);
  float: left;
}
</style>