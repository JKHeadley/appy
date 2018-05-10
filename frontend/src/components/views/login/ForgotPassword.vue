<template>
  <div class="container container-table">

    <div  class="row vertical-10p">
      <div class="container">
        <img src="/static/img/white_logo_transparent_no_container_no_slogan.png" class="center-block login logo">

        <div class="page-header">
          <h1 style="text-align: center;">Forgot Password</h1>
        </div>

        <div v-if="loading" class="content content-centered">
          <pulse-loader></pulse-loader>
        </div>

        <div v-else>
          <div class="row">
            <div class="flash-message col-md-4 col-md-offset-4 text-center" v-if="flash">
              <div class="alert" :class="'alert-' + flashType">{{ flashMessage }}</div>
            </div>
          </div>

          <div v-if="!emailSent" class="text-center col-md-4 col-md-offset-4">
            <vue-form class="ui form" :state="formstate" @submit.prevent="sendResetLink">
              <validate auto-label :class="fieldClassName(formstate.email)" :debounce="250" :custom="{ email: emailValidator }">
                <vue-form-input
                  class="input-group"
                  required
                  v-model="email"
                  :formstate="formstate"
                  :type="'email'"
                  :name="'email'"
                  :placeholder="'Email'"
                  :messages="{ required: 'This field is required', email: 'Please input a valid email' }">
                  <span class="input-group-addon"><i class="fa fa-envelope"></i></span>
                </vue-form-input>
              </validate>

              <div class="content-centered">
                <button type="submit" class="btn btn-primary btn-lg" style="margin-top: 15px;"
                        :disabled="formstate.$pristine || formstate.$invalid">Request Link</button>
              </div>
            </vue-form>
          </div>

          <div v-if="!accountActive && emailSent" class="content-centered">
            <router-link to="/login">
              <button class="btn btn-primary" style="margin-top: 15px;">
                Proceed to Login
              </button>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { authService, formService } from '../../../services'

  export default {
    name: 'ForgotPassword',
    data () {
      return {
        loading: false,
        formstate: {},
        flash: false,
        flashType: null,
        flashMessage: '',
        accountActive: true,
        emailSent: false,
        email: '',
        password: ''
      }
    },
    methods: {
      fieldClassName: formService.fieldClassName,
      emailValidator: formService.emailValidator,
      sendResetLink () {
        this.loading = true
        authService.sendResetLink(this.email)
          .then((response) => {
            this.loading = false
            this.emailSent = true
            this.flash = true
            this.flashType = 'success'
            this.flashMessage = 'An email has been sent with further instructions.'
          })
          .catch(error => {
            this.loading = false
            console.error('ForgotPassword.sendResetLink-error:', error)
            this.flash = true
            this.flashType = 'error'
            // NOTE: For more secure applications, the server should respond with a success even if the user isn't found
            // since this reveals the existence of an account. For more information, refer to the links below:
            // https://postmarkapp.com/guides/password-reset-email-best-practices
            // https://security.stackexchange.com/questions/40694/disclose-to-user-if-account-exists
            if (error.data.message === 'User not found.') {
              this.flashMessage = 'No account was found with that email.'
            } else {
              this.flashMessage = 'There was an error sending the email. ' +
                'Please try again or contact us if you continue to have problems resetting your password.'
            }
          })
      }
    },
    created () {
      this.flash = true
      this.flashType = 'info'
      this.flashMessage = 'Please enter the email address for your account and click the button below to send ' +
        'a reset password link.'
    }
  }
</script>

<style lang="scss">
html, body, .container-table {
  height: 100%;
  background-color: #282B30 !important;
}
.container-table {
    display: table;
    color: white;
}
.vertical-center-row {
    display: table-cell;
    vertical-align: middle;
}
.vertical-20p {
  padding-top: 20%;
}
.vertical-10p {
  padding-top: 10%;
}
.logo {
  width: 15em;
  padding: 3em;
}
.loginForm .input-group {
  padding-bottom: 1em;
  height: 4em;
}
.input-group input {
  height: 4em;
}

</style>