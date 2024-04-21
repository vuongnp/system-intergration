<template>
  <div class="gate-form">
    <a-card title="Sign up" class="form-sigin-card" style="width: 400px">
      <div class="logo-header">
        <img id="logo" src="l.jpg" />
      </div>
      <a-form
        :form="form"
        layout="vertical"
        class="login-form"
        @submit="handleSubmit"
      >
        <a-form-item label="E-mail">
          <a-input
            v-decorator="[
              'username',
              {
                rules: [{ required: true, message: 'Please enter your username' }],
              },
            ]"
          />
        </a-form-item>
        <a-form-item label="Password" has-feedback>
          <a-input-password
            v-decorator="[
              'password',
              {
                rules: [
                  {
                    required: true,
                    message: 'Please enter your password!',
                  },
                  {
                    validator: validateToNextPassword,
                  },
                ],
              },
            ]"
            type="password"
          />
        </a-form-item>
        <a-form-item label="Confirm Password" has-feedback>
          <a-input-password
            v-decorator="[
              'confirm',
              {
                rules: [
                  {
                    required: true,
                    message: 'Please confirm your password!',
                  },
                  {
                    validator: compareToFirstPassword,
                  },
                ],
              },
            ]"
            type="password"
            @blur="handleConfirmBlur"
          />
        </a-form-item>
        <div class="form-button">
          <router-link :to="'/signin'">
            <a class="login-form-forgot" href=""> Sign in </a>
          </router-link>
          <a-button :loading="loading" type="primary" html-type="submit"> Sign up </a-button>
        </div>
        <a-alert
          v-for="(err, index) in errorList"
          :key="index"
          style="margin-top: 12px"
          :message="err.content"
          type="error"
          show-icon
        />
      </a-form>
    </a-card>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      confirmDirty: false,
      form: this.$form.createForm(this, { name: "register" }),
    };
  },
  computed: mapState({
    errorList: (state) => state.auth.errorList,
      loading: state => state.auth.loading
  }),
  methods: {
    handleSubmit(e) {
      e.preventDefault();
      this.form.validateFields((err, values) => {
        if (!err) {
          this.$store.dispatch("auth/signup", values, this);
        }
      });
    },
    handleConfirmBlur(e) {
      const value = e.target.value;
      this.confirmDirty = this.confirmDirty || !!value;
    },
    compareToFirstPassword(rule, value, callback) {
      const form = this.form;
      if (value && value !== form.getFieldValue("password")) {
        callback("Incorrect");
      } else {
        callback();
      }
    },
    validateToNextPassword(rule, value, callback) {
      const form = this.form;
      if (value && this.confirmDirty) {
        form.validateFields(["confirm"], { force: true });
      }
      callback();
    },
  },
};
</script>
<style scoped>
.form-sigin-card {
  -webkit-box-shadow: 0 30px 60px 0 rgba(0, 0, 0, 0.3);
  box-shadow: 0 30px 60px 0 rgba(0, 0, 0, 0.3);
}
.logo-header {
  display: flex;
  justify-content: center;
}
.form-button {
  display: flex;
  justify-content: space-between;
  padding: 8px 4px 0 4px;
}
.login-form {
  padding: 0px 32px 32px 32px;
}
</style>