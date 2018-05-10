<template>
  <div class="container container-table">
      <div class="row vertical-10p">
        <div class="container">
          <img src="/static/img/white_logo_transparent_no_container_no_slogan.png" class="center-block login logo">

          <div class="page-header">
            <h1 style="text-align: center;">Account Activation</h1>
          </div>

          <div class="row">
            <div class="flash-message col-md-4 col-md-offset-4 text-center" v-if="flash">
              <div class="alert" :class="'alert-' + flashType">{{ flashMessage }}</div>
            </div>
          </div>


          <div>
            <div v-if="loading" class="content content-centered">
              <pulse-loader></pulse-loader>
            </div>
            <div v-else class="content-centered">
              <router-link to="/login">
                <button class="btn btn-primary">
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
  import { authService } from '../../../services'

  export default {
    name: 'ActivateAccount',
    data () {
      return {
        loading: false,
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
      activateAccount (token) {
        this.loading = true

        authService.activateAccount(token)
          .then((response) => {
            this.loading = false

            this.flash = true
            this.flashType = 'success'
            console.log('ActivateAccount.activateAccount-success:\n', response)
            this.flashMessage = 'Congratulations! Your account has been activated. ' +
              'Please proceed to the login page to sign in with your account.'
          })
          .catch((error) => {
            this.loading = false

            this.flash = true
            this.flashType = 'error'
            console.error('ActivateAccount.activateAccount-error:\n', error)
            this.flashMessage = 'There was an error during the activation process. The token in your email link may be expired, ' +
              'you can request a new activation email to be sent during your next login attempt.'
          })
      }
    },
    created () {
      // if the user was directed here via a link with a key, then activate their account
      if (this.$route.query.token) {
        this.activateAccount(this.$route.query.token)
      } else {
        console.error('ActivateAccount.init-error:', 'no token')
        this.flash = true
        this.flashType = 'error'
        this.flashMessage = 'The link you used did not contain a token. Please click on the activation link in your email ' +
          'to activate your account, or proceed to login to request a new activation email.'
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