<template>
  <div class="list-notice-pane">
    <a-list
      :loading="spinning"
      :pagination="{
        ...pagination,
        onChange: onChangePage,
      }"
      item-layout="horizontal"
      :data-source="listData"
      class="list-noti"
    >
      <a-list-item slot="renderItem" key="item.title" slot-scope="item">
        <!-- <a slot="actions" @click="()=>handleReadNotice(item)">
          <a-icon type="check" style="margin-right: 8px"
        /></a>
        <a slot="actions"> <a-icon type="read" style="margin-right: 8px" /></a> -->
        <a slot="actions"><a-icon type="delete" style="margin-right: 8px" /></a>

        <a-list-item-meta :description="item.time | shortTime">
          <a @click="() => handleRedirect(item)" slot="title">{{
            item.content
          }}</a>
          <!-- <a-avatar
            slot="avatar"
            src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
          /> -->
        </a-list-item-meta>
        <div v-if="!item.status"><a-badge status="success" text="New" /></div>
      </a-list-item>
    </a-list>
  </div>
</template>
<script>
import moment from "moment";
import { TIME_FORMAT } from "../utils/constants";
import { mapState } from "vuex";
export default {
  filters: {
    shortTime: (value) => {
      return moment(value).format(TIME_FORMAT.SHORT_FULL_TIME);
    },
  },
  data() {
    return {
      loadingMore: false,
      showLoadingMore: true,
    };
  },
  computed: {
    ...mapState({
      spinning: (state) => state.noti.spinning,
      listData: (state) => state.noti.data.listData,
      pagination: (state) => state.noti.data.pagination,
      loading: (state) => state.noti.loading,
    }),
  },
  created() {
    this.$store.dispatch("noti/getNotification", 1);
  },
  beforeDestroy()
  {
   this.$noti.socket.emit('read-all-notice', []);
  },
  methods: {
    handleRedirect(item) {
      if (item.action) this.$router.push(item.action);
    },
    handleReadNotice(notice) {
      this.$noti.socket.emit('read-notice', [notice.id]);
    },
    onChangePage(page) {
      this.$store.dispatch("noti/getNotification", page);
    },
  },
};
</script>
<style>
.list-notice-pane {
  padding: 50px 7% 20px 7%;
}
.list-noti {
  padding: 20px 25px 10px 25px !important;
  background: #fff;
  border-radius: 5px;
}
</style>