<template>
  <div style="padding: 0 10px 0 10px">
    <join-group />
    <a-modal
      title="Confirm"
      v-model="visible"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <p>{{ currentModalGroup ? currentModalGroup.confirmText : "" }}</p>
    </a-modal>

    <hr style="margin: 0; opacity: 50%" />
    <a-spin :spinning="spinning" style="margin-top: 56px" tip="Loading...">
      <div style="max-height: 600px; overflow-y: auto">
        <a-row
          style="padding: 16px"
          type="flex"
          justify="space-around"
          align="middle"
        >
          <group-card
            v-for="(group, id) in listGroup"
            @open-confirm-dialog="(value) => handleOpenConfirmPopup(value)"
            :key="id"
            :group="group"
          />
        </a-row>
      </div>
    </a-spin>
  </div>
</template>

<script>
import { mapState } from "vuex";
import GroupCard from "./AllGroup/GroupCard.vue";
import JoinGroup from "./AllGroup/JoinGroup.vue";
export default {
  components: { GroupCard, JoinGroup },
  data() {
    return {
      visible: false,
      currentModalGroup: null,
    };
  },
  computed: {
    ...mapState({
      spinning: (state) => state.group.spinning,
      listGroup: (state) => state.group.listGroup,
    }),
  },
  created() {
    this.$store.dispatch("group/fetchAllGroup");
  },
  methods: {
    handleOk() {
      this.$store.dispatch(
        this.currentModalGroup?.action,
        this.currentModalGroup?.group?._id
      );
      this.visible = false;
      this.currentModalGroup = null;
    },
    handleCancel() {
      this.visible = false;
      this.currentModalGroup = null;
    },
    handleOpenConfirmPopup(value) {
      // console.log(value);
      this.visible = true;
      this.currentModalGroup = value;
    },
  },
};
</script>