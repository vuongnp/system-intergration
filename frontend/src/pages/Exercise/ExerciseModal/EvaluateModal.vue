<template>
  <div>
    <a-modal :visible="visibleEvaluateModal" @cancel="handleClose">
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
        <a-form-item label="Point">
          <a-input-number style="width: 40%" :max="10" :min="0" v-decorator="[
              'point',
              {
                rules: [{ required: true, message: 'Enter point' }],
              },
            ]">
           
          ></a-input-number>
        </a-form-item>
        <a-form-item label="Comment">
          <a-textarea
            v-decorator="[
              'evaluate',
              {
                rules: [{ required: true, message: 'Enter comment' }],
              },
            ]"
          ></a-textarea>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<script>
import { mapState } from "vuex";
export default {
  props: ["group_id"],
  data() {
    return {
      form: null,
      username: localStorage.username,
    };
  },
  computed: {
    ...mapState({
      loading: (state) => state.loading,
      visibleEvaluateModal: (state) => state.exercise.visibleModalEvaluate,
      formDataEvaluate: (state) => state.exercise.formDataEvaluate,
      selectedSubmit: (state) => state.exercise.selectedSubmit,
    }),
  },
  watch: {
    selectedSubmit(value) {
      this.form.setFieldsValue({
        point: this.selectedSubmit?.point,
        evaluate: this.selectedSubmit?.evaluate,
      });
    },
  },
  updated() {
    // this.form.setFields  ({
    //   name: this.selectedItem?.name,
    //   description: this.selectedItem?.description,
    // });
  },
  created() {
    this.form = this.$form.createForm(this, {
      mapPropsToFields: () => {
        return {
          point: this.$form.createFormField({
            value: this.formDataEvaluate?.point,
          }),
          evaluate: this.$form.createFormField({
            value: this.formDataEvaluate?.evaluate,
          }),
        };
      },
      onValuesChange: (_, values) => {
        this.$store.commit("exercise/setFormEvaluateData", values);
      },
    });

    this.form.getFieldDecorator("point", {
      rules: [{ required: true, message: "Enter point" }],
    });
    this.form.getFieldDecorator( "evaluate", {
      rules: [{ required: true, message: "Enter comment" }],
    });
  },
  methods: {
    handleClose() {
      this.$store.commit("exercise/setVisibleModalEvaluate", false);
      // this.$store.dispatch("exercise/resetForm", false);
    },
    handleOk(e) {
      this.form.validateFields((err, values) => {
        if (!err) {
          this.$store.dispatch("exercise/submitEvaluateExercise", this.group_id);
        }
      });
    },
  },
};
</script>
<style scoped>
</style>