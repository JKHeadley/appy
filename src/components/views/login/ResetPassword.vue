<template>
  <div class="container" style="color: white;">

    <div  class="row vertical-10p">
      <div class="container">
        <img src="/static/img/logo.png" class="center-block logo">

        <div class="page-header">
          <h1 style="text-align: center;">Reset Password</h1>
        </div>

        <div v-if="loading" class="content content-centered">
          <pulse-loader></pulse-loader>
        </div>

        <div v-show="!loading">
          <div class="row">
            <div class="flash-message col-md-4 col-md-offset-4 text-center" v-if="flash">
              <div class="alert" :class="'alert-' + flashType">{{ flashMessage }}</div>
            </div>
          </div>

          <div v-if="!passwordReset" class="col-md-4 col-md-offset-4">
            <vue-form :state="formstate" @submit.prevent="resetPassword" class="row">

              <validate auto-label class="form-group" :class="fieldClassName(formstate.newPassword)" :debounce="250" :custom="{ notStrong: passwordScoreValidator }">
                <vue-form-input
                  required
                  @input="valicateConfirm"
                  v-model="newPassword"
                  :formstate="formstate"
                  :type="'password'"
                  :label="'New Password:'"
                  :name="'newPassword'"
                  :messages="{ required: 'This field is required', notStrong: 'Password not strong enough' }">
                </vue-form-input>
              </validate>

              <validate auto-label class="form-group" :class="fieldClassName(formstate.confirmPassword)" :debounce="250" :custom="{ notMatch: passwordConfirmValidator }">
                <vue-form-input
                  required
                  v-model="confirmPassword"
                  :formstate="formstate"
                  :type="'password'"
                  :label="'Confirm Password:'"
                  :name="'confirmPassword'"
                  :messages="{ required: 'This field is required', notMatch: 'Passwords do not match' }">
                </vue-form-input>
              </validate>

              <validate auto-label class="form-group" :class="fieldClassName(formstate.pin)">
                <vue-form-input
                  required
                  v-model="pin"
                  :formstate="formstate"
                  :type="'text'"
                  :label="'Enter PIN:'"
                  :name="'pin'"
                  :messages="{ required: 'This field is required' }">
                </vue-form-input>
              </validate>

              <div class="content-centered">
                <button type="submit" class="btn btn-primary btn-lg" style="margin-top: 15px;"
                        :disabled="formstate.$pristine || formstate.$invalid || passwordScoreUpdating">Reset Password</button>

                <router-link to="/login" v-if="error">
                  <button class="btn btn-primary btn-lg" style="margin-top: 15px;">
                    Proceed to Login
                  </button>
                </router-link>
              </div>
            </vue-form>
          </div>

          <div v-if="passwordReset" class="content-centered">
            <router-link to="/login">
              <button class="btn btn-primary btn-lg" style="margin-top: 15px;">
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
  import { authService, formService, eventBus } from '../../../services'
  import { EVENTS } from '../../../config'

  export default {
    name: 'ResetPassword',
    data () {
      return {
        loading: false,
        error: false,
        formstate: {},
        flash: false,
        flashType: null,
        flashMessage: '',
        passwordReset: false,
        newPassword: '',
        confirmPassword: '',
        pin: '',
        passwordScore: 0,
        passwordScoreUpdating: false
      }
    },
    methods: {
      fieldClassName: formService.fieldClassName,
      emailValidator: formService.emailValidator,
      passwordScoreValidator () {
        return formService.passwordScoreValidator(this.passwordScore)
      },
      passwordConfirmValidator (confirmPassword) {
        return formService.passwordConfirmValidator(this.newPassword, confirmPassword)
      },
      valicateConfirm () {
        this.formstate.confirmPassword._validate()
      },
      resetPassword () {
        this.loading = true
        authService.resetPassword(this.$route.query.token, this.newPassword, this.pin)
          .then((response) => {
            this.loading = false
            this.passwordReset = true

            this.flash = true
            this.flashType = 'success'
            console.log('ResetPassword.sendResetLink-success:\n', response)
            this.flashMessage = 'Your password has been updated. ' +
              'Please proceed to the login page to sign in.'
          })
          .catch((error) => {
            this.loading = false
            this.error = true

            this.flash = true
            this.flashType = 'error'
            console.error('ResetPassword.sendResetLink-error:\n', error)

            if (error.data.message === 'Invalid PIN.') {
              this.flashMessage = 'The PIN you provided is invalid. If you continue to have problems resetting your' +
                ' password please contact your administrator.'
            } else {
              this.flashMessage = 'There was an error resetting your password. The token in your email link may be expired. ' +
                'You can repeat the forgot password process to receive a new link.'
            }
          })
      }
    },
    created () {
      // if the user was directed here via a link with a key, then activate their account
      if (!this.$route.query.token) {
        console.error('ResetPassword.init-error:', 'no token')
        this.flash = true
        this.flashType = 'error'
        this.flashMessage = 'The link you used did not contain a token. Please click on the reset password link in your email ' +
          'or proceed to the login page to request a new email.'
      }
      eventBus.$on(EVENTS.PASSWORD_SCORE_UPDATED, (passwordScore) => {
        this.passwordScoreUpdating = false
        this.passwordScore = passwordScore
      })
      eventBus.$on(EVENTS.UPDATING_PASSWORD_SCORE, () => {
        this.passwordScoreUpdating = true
      })
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
