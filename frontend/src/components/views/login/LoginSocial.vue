<template>
  <div class="container container-table">

    <div class="row vertical-10p">
      <div class="container">
        <img src="/static/img/white_logo_transparent_no_container_no_slogan.png" class="center-block login logo">

        <div class="page-header">
          <h1 style="text-align: center;">Social Login</h1>
        </div>

        <div v-if="loading" class="content content-centered">
          <pulse-loader></pulse-loader>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
  import { authService } from '../../../services'

  export default {
    name: 'LoginSocial',
    data () {
      return {
        loading: false,
        flash: false,
        flashType: null,
        flashMessage: '',
      }
    },
    methods: {
      loginSocial (token) {
        this.loading = true

        authService.loginSocial(token)
          .then(response => {
            this.loading = false
            this.$snotify.success('Login successful', 'Success!')
            this.$router.push('/')
          })
          .catch(error => {
            this.loading = false
            console.error('LoginSocial.loginSocial-error:', error)
            this.flash = true
            this.flashType = 'error'
            if (error.data.message === 'Invalid Email or Password.') {
              this.flashMessage = error.data.message
            } else if (error.data.message === 'Account is inactive.') {
              this.accountActive = false
              this.flashType = 'info'
              this.flashMessage = 'You need to activate your account. Please enter your email address and ' +
                'click the link below to resend an activation email.'
            } else if (error.data.message === 'Account is disabled.') {
              this.flashMessage = 'Your account has been disabled. Please contact the SuperAdmin ' +
                'to enable your account.'
            } else if (error.data.message === 'Account is deleted.') {
              this.flashMessage = 'This account has been deleted'
            } else if (error.data.message === 'Maximum number of auth attempts reached. Please try again later.') {
              this.flashMessage = error.data.message
            } else {
              this.flashMessage = 'There was an error logging in, please try again.'
            }
          })
      }
    },
    created () {
      if (!this.$route.query.token) {
        console.error('ResetPassword.init-error:', 'no token')
        this.flash = true
        this.flashType = 'error'
        this.flashMessage = 'The link you used did not contain a token. Please click on one of the social media ' +
          'buttons on the login page to login using social media.'
      } else {
        this.loginSocial(this.$route.query.token)
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
  .btn-outline:hover {
    color: #333333;
  }


</style>