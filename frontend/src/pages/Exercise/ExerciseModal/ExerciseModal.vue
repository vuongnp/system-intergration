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
        <a-form-item label="Name">
          <a-input
            v-decorator="[
              'name',
              {
                rules: [
                  { required: true, message: 'Please enter name of assignment' },
                ],
                initialValue: formData.name,
              },
            ]"
          >
          </a-input>
        </a-form-item>
        <a-form-item label="Description">
          <a-textarea
            v-decorator="[
              'description',
              {
                rules: [
                  { required: true, message: 'Please enter description of assignment' },
                ],
                initialValue: formData.description,
              },
            ]"
          ></a-textarea>
        </a-form-item>
        <a-form-item label="Deadine">
          <a-row>
            <a-col :span="12">
              <a-form-item>
                <a-time-picker
                  format="HH:mm"
                  style="width: 80%"
                  v-decorator="[
                    'time_expired',
                    {
                      rules: [
                        { required: true, message: 'Please select time expired' },
                      ],
                      initialValue: formData.time_expired,
                    },
                  ]"
                ></a-time-picker>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item>
                <a-date-picker
                  style="width: 80%"
                  v-decorator="[
                    'date_expired',
                    {
                      rules: [
                        { required: true, message: 'Please select date expired' },
                      ],
                      initialValue: formData.date_expired,
                    },
                  ]"
                ></a-date-picker>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<script>
import moment from "moment";
import { mapState } from "vuex";
import { TIME_FORMAT } from "../../../utils/constants";
export default {
  props: ["group_id"],
  data() {
    return {
      visible: false,
      form: null,
      username: localStorage.username,
    };
  },
  computed: {
    ...mapState({
      loading: (state) => state.loading,
      visibleModal: (state) => state.exercise.visibleModal,
      formData: (state) => state.exercise.formData,
      selectedItem: (state) => state.exercise.selectedItem,
    }),
  },
  watch: {
    selectedItem(value) {
      this.form.setFieldsValue({
        name: this.selectedItem?.name,
        description: this.selectedItem?.description,
        time_expired: moment(this.selectedItem?.deadline),
        date_expired: moment(this.selectedItem?.deadline),
      });
    },
  },
  updated() {},
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
          time_expired: this.$form.createFormField({
            value: this.formData?.time_expired,
          }),
          date_expired: this.$form.createFormField({
            value: this.formData?.date_expired,
          }),
        };
      },
      onValuesChange: (_, values) => {
        this.$store.commit("exercise/setFormData", values);
      },
    });
    this.form.getFieldDecorator("name", {
      rules: [{ required: true, message: "Please enter name of assignment" }],
    });
    this.form.getFieldDecorator("description", {
      rules: [{ required: true, message: "Please enter description of assignment" }],
    });
    this.form.getFieldDecorator("time_expired", {
      rules: [{ required: true, message: "Please select time expired" }],
    });
    this.form.getFieldDecorator("date_expired", {
      rules: [{ required: true, message: "Please select date expired" }],
    });
  },
  methods: {
    handleClose() {
      this.$store.commit("exercise/setVisibleModal", false);
      // this.$store.dispatch("exercise/resetForm", false);
    },
    handleOk(e) {
      this.form.validateFields((err, values) => {
        if (!err) {
          if (this.selectedItem?._id)
            this.$store.dispatch("exercise/submitEditExercise");
          else this.$store.dispatch("exercise/submitCreateExercise", this.group_id);
        }
      });
    },
  },
};
</script>
<style scoped>
</style>