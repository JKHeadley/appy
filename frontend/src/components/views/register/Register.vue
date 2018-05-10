<template>
  <div class="container" style="color: white;">

    <div class="row vertical-10p">
      <div class="container">
        <img src="/static/img/white_logo_transparent_no_container_no_slogan.png" class="center-block login logo">

        <div class="page-header">
          <h1 style="text-align: center;">Create an account</h1>
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

          <div v-if="!registerSuccess" class="col-md-4 col-md-offset-4">
            <vue-form :state="formstate" @submit.prevent="registerUser" class="row">

              <validate auto-label class="form-group" :class="fieldClassName(formstate.firstName)">
                <vue-form-input
                  required
                  v-model="user.firstName"
                  :formstate="formstate"
                  :type="'text'"
                  :label="'First Name:'"
                  :name="'firstName'"
                  :placeholder="'Please enter your first name.'"
                  :messages="{ required: 'This field is required' }">
                </vue-form-input>
              </validate>

              <validate auto-label class="form-group" :class="fieldClassName(formstate.lastName)">
                <vue-form-input
                  required
                  v-model="user.lastName"
                  :formstate="formstate"
                  :type="'text'"
                  :label="'Last Name:'"
                  :name="'lastName'"
                  :placeholder="'Please enter your last name.'"
                  :messages="{ required: 'This field is required' }">
                </vue-form-input>
              </validate>

              <validate auto-label class="form-group" :class="fieldClassName(formstate.email)" :debounce="250" :custom="{ email: emailValidator, notUnique: emailUniqueValidator }">
                <vue-form-input
                  required
                  v-model="user.email"
                  :formstate="formstate"
                  :type="'email'"
                  :label="'Email:'"
                  :name="'email'"
                  :placeholder="'Please enter your email address.'"
                  :messages="{ email: 'Please input a valid email', required: 'This field is required', notUnique: 'That email is already in use.' }">
                </vue-form-input>
              </validate>

              <validate auto-label class="form-group" :class="fieldClassName(formstate.newPassword)" :debounce="250" :custom="{ notStrong: passwordScoreValidator }">
                <vue-form-input
                  required
                  @input="validateConfirm"
                  v-model="user.password"
                  :formstate="formstate"
                  :type="'password'"
                  :label="'Password:'"
                  :name="'Password'"
                  :placeholder="'Please enter your password.'"
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
                  :placeholder="'Please confirm your password.'"
                  :messages="{ required: 'This field is required', notMatch: 'Passwords do not match' }">
                </vue-form-input>
              </validate>

              <div class="flash-message">
                <div class="alert" :class="'alert-info'">NOTE: Your 4 digit PIN will be required if you need to reset your
                password in the future. Please keep it somewhere safe.</div>
              </div>

              <validate auto-label class="form-group" :class="fieldClassName(formstate.pin)" :custom="{ minlength: minlengthValidator(4) }">
                <vue-form-input
                  required
                  v-model="user.pin"
                  :formstate="formstate"
                  :type="'text'"
                  :label="'PIN:'"
                  :name="'pin'"
                  :mask="'1111'"
                  :minlength="'4'"
                  :placeholder="'Please enter your 4 digit PIN.'"
                  :messages="{ required: 'This field is required', minlength: 'PIN must be 4 digits.' }">
                </vue-form-input>
              </validate>

              <div class="content-centered">
                <button type="submit" class="btn btn-primary btn-lg" style="margin-top: 15px;"
                        :disabled="formstate.$pristine || formstate.$invalid || passwordScoreUpdating">Register Account</button>
              </div>
            </vue-form>
          </div>

          <div v-if="registerSuccess" class="content-centered">
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
  import { EVENTS, USER_ROLES } from '../../../config'

  export default {
    name: 'Register',
    data () {
      return {
        loading: false,
        error: false,
        formstate: {},
        flash: false,
        flashType: null,
        flashMessage: '',
        registerSuccess: false,
        user: {},
        confirmPassword: '',
        passwordScore: 0,
        passwordScoreUpdating: false
      }
    },
    methods: {
      fieldClassName: formService.fieldClassName,
      emailValidator: formService.emailValidator,
      emailUniqueValidator: formService.emailUniqueValidator,
      minlengthValidator (minlength) {
        // the masked input comes with '_' chars, so we need to remove those before checking the length
        return (input) => { return formService.minlengthValidator(input.split('_')[0], minlength) }
      },
      passwordScoreValidator () {
        return formService.passwordScoreValidator(this.passwordScore)
      },
      passwordConfirmValidator (confirmPassword) {
        return formService.passwordConfirmValidator(this.user.password, confirmPassword)
      },
      validateConfirm () {
        this.formstate.confirmPassword._validate()
      },
      registerUser () {
        this.loading = true
        authService.registerUser(this.user)
          .then((response) => {
            this.loading = false
            this.registerSuccess = true

            this.flash = true
            this.flashType = 'success'
            this.flashMessage = 'Thank you for registering! Please check your email for an account activation link.'
          })
          .catch((error) => {
            this.loading = false
            this.error = true

            this.flash = true
            this.flashType = 'error'
            console.error('Register.registerUser-error:\n', error)
            this.flashMessage = 'There was an error during the registration process. ' +
              'Please try again or contact us if you continue to have trouble creating an account.'
          })
      }
    },
    created () {
      this.user = {
        role: USER_ROLES.USER
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
