<template>
  <div class="join-pane">
    <div class="join-tilte">
      <group-modal />
      <b style="line-height: 40px">Your groups</b>
    </div>
    <div class="join-function">
      <a-form :form="form" @submit="handleSubmit" layout="inline">
        <!-- <a-form-item class="join-item-pane" label="Nhập mã nhóm">
          <span>
            <a-input v-decorator="['group_code']" type="text" />
          </span>
        </a-form-item> -->
        <a-form-item class="join-item-pane">
          <!-- <a-button :loading="loading" type="primary" html-type="submit">
            Tham gia
          </a-button> -->
        </a-form-item>
      </a-form>

      <a-form-item class="join-item-pane">
        <a-button type="button" @click="() => setVisibleModal(true)">
          <a-icon type="plus-circle" />Create a new group</a-button
        >
      </a-form-item>
    </div>
  </div>
</template>
<script>
import { mapMutations, mapState } from "vuex";
import GroupModal from "./GroupModal.vue";
export default {
  components: { GroupModal },
  data() {
    return {
      form: this.$form.createForm(this, { name: "coordinated" }),
    };
  },
  computed: {
    ...mapState({
      loading: (state) => state.group.loading,
    }),
  },
  methods: {
    ...mapMutations({
      setVisibleModal: "group/setVisibleModal",
    }),
    handleSubmit(e) {
      e.preventDefault();
      this.form.validateFields((err, values) => {
        if (!err) {
          this.$store.dispatch("group/joinGroup", values);
        }
      });
    },
  },
};
</script>
<style scoped>
.join-pane {
  padding: 16px;
  display: flex;
  justify-content: space-between;
}
.join-title {
  line-height: 40px;
}
.join-function {
  display: flex;
  justify-content: flex-end;
}
.join-item-pane {
  margin-right: 16px !important;
}
</style>