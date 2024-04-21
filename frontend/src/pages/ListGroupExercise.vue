<template>
  <div class="list-notice-pane">
    <a-list
      :loading="spinning"
      item-layout="horizontal"
      :data-source="listData"
      class="list-noti"
    >
      <a-list-item slot="renderItem" key="item.title" slot-scope="item">
        <!-- <a slot="actions"><a-icon type="delete" style="margin-right: 8px" /></a> -->
        <a-list-item-meta :description="item.description">
          <a @click="() => handleRedirect(item)" slot="title">{{
            item.name
          }}</a>
          <a-avatar
            slot="avatar"
            src="group_img.png"
          />
        </a-list-item-meta>
        <!-- <div v-if="!item.status"><a-badge status="success" text="Mới" /></div> -->
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
    return {};
  },
  computed: {
    ...mapState({
      spinning: (state) => state.group.spinning,
      listData: (state) => state.group.listGroup,
    }),
  },
  created() {
    this.$store.dispatch("group/fetchAllGroup");
  },

  methods: {
    handleRedirect(item) {
      this.$router.push("/exercise/" + item._id);
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