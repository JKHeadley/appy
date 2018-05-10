<template>
  <section>

    <h3 class="text-center">Reset User Password</h3>

    <div v-if="loading" class="content content-centered">
      <pulse-loader></pulse-loader>
    </div>

    <div v-show="!loading" class="content">
      <div class="col-md-6 col-md-offset-3">

        <div class="flash-message">
          <div class="alert" :class="'alert-info'">NOTE: This will send a reset password email to the user, however this
            will <i>NOT</i> require the user to enter their PIN, so make sure you have verified their identity.</div>
        </div>

        <div class="content-centered">
          <button :disabled="emailSent" @click="resetPassword" class="btn btn-primary btn-lg" style="margin-top: 15px;">Reset Password</button>
        </div>
      </div>
    </div>

  </section>
</template>

<script>
  import { authService } from '../../../services'

  export default {
    name: 'UserPassword',
    props: ['user'],
    data () {
      return {
        loading: null,
        emailSent: false
      }
    },
    methods: {
      resetPassword () {
        this.loading = true

        authService.sendResetLink(this.user.email)
          .then((response) => {
            this.loading = false
            this.emailSent = true
            this.$snotify.success('Email sent', 'Success!')
          })
          .catch(error => {
            this.loading = false
            console.error('UserPassword.resetPassword-error:', error)
            this.$snotify.error('Reset password failed', 'Error!')
          })
      }
    }
  }
</script>