<template>
  <section>

    <h3 class="text-center">Update User Password</h3>

    <div v-if="loading" class="content content-centered">
      <pulse-loader></pulse-loader>
    </div>

    <div v-show="!loading" class="content">
      <div class="col-md-4 col-md-offset-4">
        <vue-form :state="formstate" @submit.prevent="updatePassword" class="row">

          <validate auto-label class="form-group" :class="fieldClassName(formstate.newPassword)" :debounce="250" :custom="{ notStrong: passwordScoreValidator }">
            <vue-form-input
              required
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

          <div class="content-centered">
            <button type="submit" class="btn btn-primary btn-lg" style="margin-top: 15px;" :disabled="formstate.$pristine || formstate.$invalid || passwordScoreUpdating">Update Password</button>
          </div>
        </vue-form>
      </div>
    </div>

  </section>
</template>

<script>
  import { formService, userService, eventBus } from '../../../services'
  import { EVENTS } from '../../../config'

  export default {
    name: 'UserPassword',
    props: ['user'],
    data () {
      return {
        loading: null,
        formstate: {},
        newPassword: '',
        confirmPassword: '',
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
      updatePassword () {
        this.loading = true
        userService.updateUserPassword(this.user._id, this.newPassword)
          .then((response) => {
            this.loading = false
            this.formstate._reset()
            this.$snotify.success('User password updated', 'Success!')
          })
          .catch((error) => {
            this.loading = false
            console.error('UserPassword.updatePassword-error:', error)
            this.$snotify.error('Update user failed', 'Error!')
          })
      }
    },
    created () {
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
