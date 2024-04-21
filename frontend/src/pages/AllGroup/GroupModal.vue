<template>
  <div>
    <a-modal
      :visible="visibleModal"
      :title="formData.title"
      @cancel="handleClose"
    >
      <template slot="footer">
        <a-button key="back" @click="handleClose"> Cancel </a-button>
        <a-button
          key="submit"
          type="primary"
          :loading="loading"
          @click="handleOk"
        >
          Confirm
        </a-button>
      </template>
      <a-form :form="form">
        <a-form-item
          label="Name"
          v-if="!formData._id || formData.owner.username === username"
        >
          <a-input
            v-decorator="[
              'name',
              {
                rules: [{ required: true, message: 'Please enter name of group' }],
                initialValue: formData.name,
              },
            ]"
            aria-placeholder="vip"
          ></a-input>
        </a-form-item>
        <a-form-item
          label="Description"
          v-if="!formData._id || formData.owner.username === username"
        >
          <a-textarea
            v-decorator="[
              'description',
              {
                rules: [{ required: true, message: 'Please enter description of group' }],
                initialValue: formData.description,
              },
            ]"
          ></a-textarea>
        </a-form-item>
        <a-form-item label="Members">
          <a-tag class="list-member-item">
            <a-icon style="color: green" type="check-circle" />
            {{
              (!formData._id || formData.owner.username === username
                ? "You"
                : formData.owner.username) + " (Owner)"
            }}
          </a-tag>
          <a-tag
            v-for="(member, index) in formData.members"
            :key="index"
            class="list-member-item"
            :closable="!formData._id || formData.owner.username === username"
            @close="() => handleRemoveUser(member)"
          >
            {{ member.username }}
          </a-tag>
        </a-form-item>
        <a-form-item label="Add member">
          <a-popover
            :visible="listSearchResultUser.length !== 0 && visibleModal"
            title="Search results"
            placement="bottomLeft"
          >
            <template slot="content">
              <div class="list-user-result">
                <div
                  v-for="(member, index) in listSearchResultUser"
                  :key="index"
                  class="list-user-result-item"
                  @click="() => handleAddOrRemoveUser(member, index)"
                >
                  <a-avatar icon="user" /> {{ member.username }}
                  <a-icon
                    v-if="member.checked"
                    style="color: green; float: right; margin-top: 6px"
                    type="check"
                  />
                </div>
              </div>
            </template>
            <a-input
              aria-placeholder="Add member"
              @change="findUser"
            ></a-input>
          </a-popover>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<script>
import { mapState } from "vuex";
let timeout;
export default {
  data() {
    return {
      visible: false,
      form: null,
      username: localStorage.username,
    };
  },
  computed: {
    ...mapState({
      loading: (state) => state.group.loading,
      visibleModal: (state) => state.group.visibleModal,
      formData: (state) => state.group.formData,
      selectedItem: (state) => state.group.selectedItem,
      listSearchResultUser: (state) => state.group.listSearchResultUser,
    }),
  },
  watch: {
    selectedItem(value) {
      if (this.visibleModal)
        this.form.setFieldsValue({
          name: value.name,
          description: value.description,
        });
    },
  },
  created() {
    this.form = this.$form.createForm(this, {
      mapPropsToFields: () => {
        return {
          name: this.$form.createFormField({
            value: this.formData?.name,
          }),
          description: this.$form.createFormField({
            value: this.formData?.description,
          }),
        };
      },
      onValuesChange: (_, values) => {
        this.$store.commit("group/setFormField", values);
      },
    });
  },
  methods: {
    handleRemoveUser(member, index) {
      this.$store.commit("group/removeUser", { member });
    },
    handleAddOrRemoveUser(member, index) {
      if (!member?.checked)
        this.$store.commit("group/addUser", { member, index });
      else this.$store.commit("group/removeUser", { member });
    },
    handleClose() {
      this.$store.commit("group/setVisibleModal", false);
      this.$store.dispatch("group/resetForm", false);
    },
    findUser({ target: { value } }) {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (value) this.$store.dispatch("group/findUser", { username: value });
      }, 700);
    },
    handleOk(e) {
      this.form.validateFields((err, values) => {
        if (!err) {
          if (
            this.formData.owner &&
            this.formData.owner.username !== this.formData.owner.username
          )
            this.$store.dispatch("group/addMemberGroup");
          else if (!this.formData._id) this.$store.dispatch("group/submit");
          else this.$store.dispatch("group/submitEditGroup");
        }
      });
    },
  },
};
</script>
<style scoped>
.list-user-result {
  max-height: 120px;
  overflow-y: scroll;
}
.list-user-result-item {
  border: 0;
  padding: 6px 4px;
  border-radius: 2px;
}
.list-user-result-item:hover {
  cursor: pointer;
  background: #c6f2fb;
}
.list-member-item.ant-tag {
  font-size: 14px !important;
  border-radius: 2px;
  margin-right: 8px;
  padding: 4px 6px;
}
</style>