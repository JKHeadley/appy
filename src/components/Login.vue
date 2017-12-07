<template>
  <div class="container container-table">

    <div v-if="loading" class="content content-centered">
      <pulse-loader></pulse-loader>
    </div>

    <div v-else="loading" class="row vertical-10p">
      <div class="container">
        <img src="/static/img/logo.png" class="center-block logo">

        <div class="flash-message" style="text-align: center;" v-if="flash">
          <div class="alert" :class="'alert-' + flashType">{{ flashMessage }}</div>
        </div>

        <div v-if="accountActive" class="text-center col-md-4 col-sm-offset-4">
          <!-- login form -->
          <form class="ui form loginForm"  @submit.prevent="login">

            <div class="input-group">
              <span class="input-group-addon"><i class="fa fa-envelope"></i></span>
              <input class="form-control" name="email" placeholder="Email" type="text" v-model="email">
            </div>

            <div class="input-group">
              <span class="input-group-addon"><i class="fa fa-lock"></i></span>
              <input class="form-control" name="password" placeholder="Password" type="password" v-model="password">
            </div>
            <button type="submit" v-bind:class="'btn btn-primary btn-lg ' + loading">Submit</button>
          </form>
        </div>


        <div v-if="!accountActive && !emailSent">
          <vue-form class="ui form" :state="formstate" @submit.prevent="sendActivationEmail">
            <validate auto-label :class="fieldClassName(formstate.email)">
              <vue-form-input
                class="input-group"
                required
                v-model="email"
                :formstate="formstate"
                :type="'email'"
                :name="'email'"
                :placeholder="'Email'"
                :messages="{ required: 'This field is required' }">
                <span class="input-group-addon"><i class="fa fa-envelope"></i></span>
              </vue-form-input>
            </validate>

            <div class="content-centered">
              <button type="submit" class="btn btn-primary btn-lg" style="margin-top: 15px;">Send Activation Email</button>
            </div>
          </vue-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { authService, formService } from '../services'

  export default {
    name: 'Login',
    data () {
      return {
        section: 'Login',
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
      login () {
        const { email, password } = this

        this.loading = true

        this.$store.dispatch('auth/login', { email, password })
          .then(response => {
            this.loading = false
            this.$snotify.success('Login successful', 'Success!')
            this.$router.push('/')
          })
          .catch(error => {
            this.loading = false
            console.error('Login.login-error:', error)
            this.flash = true
            this.flashType = 'error'
            if (error.data.message === 'Invalid Email or Password.') {
              this.flashMessage = error.data.message
            } else if (error.data.message === 'Account is inactive.') {
              this.accountActive = false
              this.flashType = 'info'
              this.flashMessage = 'You need to activate your account. Please enter your email address and ' +
                'click the link below to resend an activation email.'
            } else if (error.data.message === 'Maximum number of auth attempts reached. Please try again later.') {
              this.flashMessage = error.data.message
            } else {
              this.flashMessage = 'There was an error logging in, please try again.'
            }
          })
      },
      sendActivationEmail () {
        this.loading = true
        authService.sendActivationEmail(this.email)
          .then((response) => {
            this.loading = false
            this.emailSent = true
            this.flash = true
            this.flashType = 'success'
            this.flashMessage = 'Message sent. Please check your email for an account activation link.'
          })
          .catch((error) => {
            console.error('Login.sendActivationEmail-error:', error)
            this.flash = true
            this.flashType = 'error'
            this.flashMessage = 'There was an error sending the email. ' +
              'Please try again or contact us if you continue to have trouble creating an account.'
          })
      }
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
