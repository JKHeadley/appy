<template>
  <section>
    <div v-if="loading" class="content content-centered">
      <pulse-loader></pulse-loader>
    </div>

    <div v-show="!loading" class="content">

      <div class="flash-message text-center" v-if="updateRequiredMessage">
        <div class="alert" :class="'alert-info'">{{updateRequiredMessage}}</div>
      </div>

      <div class="box box-primary">
        <div class="box-body">

          <ul class="nav nav-tabs">
            <li :class="pictureActive"><a data-toggle="tab" href="#picture">Picture</a></li>
            <li :class="detailsActive"><a data-toggle="tab" href="#details">Details</a></li>
            <li :class="settingsActive"><a data-toggle="tab" href="#settings">Settings</a></li>
          </ul>

          <div class="tab-content content">
            <div id="picture" class="tab-pane fade in" :class="pictureActive">
              <profile-image></profile-image>
            </div>
            <div id="details" class="tab-pane fade in" :class="detailsActive" >

              <div class="col-md-12">
                <vue-form :state="formstate" @submit.prevent="onSubmit" class="row">

                  <validate auto-label class="form-group" :class="fieldClassName(formstate.firstName)">
                    <vue-form-input
                      required
                      v-model="newProfile.firstName"
                      :formstate="formstate"
                      :type="'text'"
                      :label="'First Name:'"
                      :name="'firstName'"
                      :messages="{ required: 'This field is required' }">
                    </vue-form-input>
                  </validate>

                  <validate auto-label class="form-group" :class="fieldClassName(formstate.lastName)">
                    <vue-form-input
                      required
                      v-model="newProfile.lastName"
                      :formstate="formstate"
                      :type="'text'"
                      :label="'Last Name:'"
                      :name="'lastName'"
                      :messages="{ required: 'This field is required' }">
                    </vue-form-input>
                  </validate>

                  <validate auto-label class="form-group" :class="fieldClassName(formstate.email)" :debounce="250" :custom="{ email: emailValidator, notUnique: emailUniqueValidator }">
                    <vue-form-input
                      required
                      v-model="newProfile.email"
                      :formstate="formstate"
                      :type="'email'"
                      :label="'Email:'"
                      :name="'email'"
                      :messages="{ email: 'Please input a valid email', required: 'This field is required', notUnique: 'That email is already in use.' }">
                    </vue-form-input>
                  </validate>

                  <validate auto-label class="form-group" :class="fieldClassName(formstate.title)">
                    <vue-form-input
                      v-model="newProfile.title"
                      :formstate="formstate"
                      :type="'text'"
                      :label="'Title:'"
                      :placeholder="'Ex: Central Marketing Developer'"
                      :name="'title'"
                      :messages="{}">
                    </vue-form-input>
                  </validate>

                  <validate auto-label class="form-group" :class="fieldClassName(formstate.location)">
                    <vue-form-input
                      v-model="newProfile.location"
                      :formstate="formstate"
                      :type="'text'"
                      :label="'Location:'"
                      :placeholder="'City, State, Country'"
                      :name="'location'"
                      :messages="{}">
                    </vue-form-input>
                  </validate>

                  <validate auto-label class="form-group" :class="fieldClassName(formstate.education)">
                    <vue-form-input
                      v-model="newProfile.education"
                      :formstate="formstate"
                      :type="'text'"
                      :label="'Education:'"
                      :placeholder="'Ex: B.S. in Computer Science from the University of Tennessee at Knoxville'"
                      :name="'education'"
                      :messages="{}">
                    </vue-form-input>
                  </validate>

                  <label>Bio:</label>
                  <textarea v-model="newProfile.bio" class="form-control" style="height:200px;" placeholder="Ex: I'm an amazingly interesting person!"></textarea>

                </vue-form>

                <div class="py-2 text-center row" style="margin-top: 10px">
                  <button class="btn btn-primary" type="submit" @click="updateProfile" :disabled="formstate.$pristine || formstate.$invalid">Update Profile</button>
                  <button class="btn btn-primary" type="submit" @click="clearChanges" :disabled="formstate.$pristine">Clear Changes</button>
                </div>

                <div class="py-2 text-center row" style="margin-top: 10px">
                  <button class="btn btn-danger" @click="deleteUserModal">Delete Account</button>
                </div>
              </div>

            </div>
            <div id="settings" class="tab-pane fade in" :class="settingsActive">

              <div class="callout callout-info">
                <h4>Tip!</h4>

                <p>Your 4 digit PIN will be required if you need to reset your
                  password in the future. Please keep it somewhere safe.</p>
              </div>

              <div class="col-md-4 col-md-offset-4">
                <vue-form :state="passwordFormstate" @submit.prevent="updatePassword" class="row">

                  <validate auto-label class="form-group" :class="fieldClassName(passwordFormstate.newPassword)" :debounce="250" :custom="{ notStrong: passwordScoreValidator }">
                    <vue-form-input
                      required
                      @input="validateConfirm"
                      v-model="newPassword"
                      :passwordFormstate="passwordFormstate"
                      :type="'password'"
                      :label="'New Password:'"
                      :name="'newPassword'"
                      :placeholder="'Please enter your new password.'"
                      :messages="{ required: 'This field is required', notStrong: 'Password not strong enough' }">
                    </vue-form-input>
                  </validate>

                  <validate auto-label class="form-group" :class="fieldClassName(passwordFormstate.confirmPassword)" :debounce="250" :custom="{ notMatch: passwordConfirmValidator }">
                    <vue-form-input
                      required
                      v-model="confirmPassword"
                      :passwordFormstate="passwordFormstate"
                      :type="'password'"
                      :label="'Confirm Password:'"
                      :name="'confirmPassword'"
                      :placeholder="'Please confirm your password.'"
                      :messages="{ required: 'This field is required', notMatch: 'Passwords do not match' }">
                    </vue-form-input>
                  </validate>

                  <div class="content-centered">
                    <button type="submit" class="btn btn-primary btn-lg" style="margin-top: 15px;"
                            :disabled="passwordFormstate.$pristine || passwordFormstate.$invalid || passwordScoreUpdating">Update Password</button>

                  </div>
                </vue-form>

                <vue-form :state="pinFormstate" @submit.prevent="updatePIN" class="row">

                  <validate auto-label class="form-group" :class="fieldClassName(pinFormstate.pin)" :custom="{ minlength: minlengthValidator(4) }">
                    <vue-form-input
                      required
                      v-model="pin"
                      :pinFormstate="pinFormstate"
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
                            :disabled="pinFormstate.$pristine || pinFormstate.$invalid || passwordScoreUpdating">Update PIN</button>

                  </div>
                </vue-form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
  import ProfileImage from './ProfileImage.vue'
  import { userService, authService, formService, eventBus } from '../../../services'
  import { EVENTS } from '../../../config'
  import swal from 'sweetalert2'

  import _ from 'lodash'

  export default {
    name: 'Profile',
    components: {
      ProfileImage
    },
    data () {
      return {
        ready: false,
        loading: false,
        detailsActive: '',
        pictureActive: '',
        settingsActive: '',
        updateRequiredMessage: '',
        newProfile: {},
        oldProfile: {},
        passwordFormstate: {},
        formstate: {},
        pinFormstate: {},
        newPassword: '',
        confirmPassword: '',
        pin: null,
        passwordScore: 0,
        passwordScoreUpdating: false
      }
    },
    methods: {
      fieldClassName: formService.fieldClassName,
      emailValidator: formService.emailValidator,
      emailUniqueValidator (email) {
        return formService.emailUniqueValidator(email, this.oldProfile.email)
      },
      minlengthValidator (minlength) {
        // the masked input comes with '_' chars, so we need to remove those before checking the length
        return (input) => { return formService.minlengthValidator(input.split('_')[0], minlength) }
      },
      passwordScoreValidator () {
        return formService.passwordScoreValidator(this.passwordScore)
      },
      passwordConfirmValidator (confirmPassword) {
        return formService.passwordConfirmValidator(this.newPassword, confirmPassword)
      },
      validateConfirm () {
        this.passwordFormstate.confirmPassword._validate()
      },
      clearChanges () {
        this.newProfile = _.cloneDeep(this.oldProfile)
        this.formstate._reset()
      },
      updateProfile () {
        this.loading = true
        return userService.updateUserProfile(this.newProfile)
          .then((response) => {
            this.loading = false
            this.formstate._reset()
            this.oldProfile = _.cloneDeep(this.newProfile)
            // Update the global user object
            const user = Object.assign(this.$store.state.auth.user, this.newProfile)
            user.profileImageUrl = this.profileImageUrl
            this.$store.commit('auth/SET_USER', user)
            this.$snotify.success('Profile updated', 'Success!')
          })
          .catch((error) => {
            this.loading = false
            console.error('UserProfile.updateProfile-error:', error)
            this.$snotify.error('Update profile failed', 'Error!')
          })
      },
      updatePassword () {
        this.loading = true
        userService.updateUserPassword(this.newPassword)
          .then((response) => {
            this.loading = false
            this.newPassword = ''
            this.confirmPassword = ''
            this.passwordFormstate._reset()
            // Update the global user object
            const user = Object.assign(this.$store.state.auth.user, { passwordUpdateRequired: false })
            this.$store.commit('auth/SET_USER', user)
            this.$snotify.success('Password updated', 'Success!')
          })
          .catch((error) => {
            this.loading = false
            console.error('UserProfile.updatePassword-error:', error)
            this.$snotify.error('Update password failed', 'Error!')
          })
      },
      updatePIN () {
        this.loading = true
        userService.updateUserPIN(this.pin)
          .then((response) => {
            this.loading = false
            this.pinFormstate._reset()
            // Update the global user object
            const user = Object.assign(this.$store.state.auth.user, { pinUpdateRequired: false })
            this.$store.commit('auth/SET_USER', user)
            this.$snotify.success('PIN updated', 'Success!')
          })
          .catch((error) => {
            this.loading = false
            console.error('UserProfile.updatePIN-error:', error)
            this.$snotify.error('Update pin failed', 'Error!')
          })
      },
      deleteUserModal () {
        swal({
          title: 'Are you sure?',
          text: 'This will permanently delete your account!',
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
          if (result.value) {
            this.deleteUser()
          }
        })
      },
      deleteUser () {
        this.loading = true
        return userService.deleteCurrentAccount(this.newProfile._id)
          .then((response) => {
            this.loading = false
            return swal(
              'Deleted!',
              'Your account has been deleted.',
              'success'
            )
          })
          .then((result) => {
            authService.logout()
            this.$router.push('/login')
          })
          .catch((error) => {
            this.loading = false
            console.error('UserProfile.deleteUser-error:', error)
            this.$snotify.error('Delete account failed', 'Error!')
          })
      }
    },
    created () {
      // Filter out unneeded user properties for the profile
      this.newProfile = (({ email, firstName, lastName, title, education, location, bio }) => {
        return { email, firstName, lastName, title, education, location, bio }
      })(this.$store.state.auth.user)

      this.oldProfile = _.cloneDeep(this.newProfile)

      // Set the active tab
      if (this.$route.query.details) {
        this.detailsActive = 'active'
      } else if (this.$route.query.settings) {
        this.settingsActive = 'active'
      } else {
        this.pictureActive = 'active'
      }
      // Notify the user of any required updates
      if (this.$store.state.auth.user.passwordUpdateRequired && this.$store.state.auth.user.pinUpdateRequired) {
        this.updateRequiredMessage = 'You must update your password and PIN to continue.'
      } else if (this.$store.state.auth.user.passwordUpdateRequired) {
        this.updateRequiredMessage = 'You must update your password to continue.'
      } else if (this.$store.state.auth.user.pinUpdateRequired) {
        this.updateRequiredMessage = 'You must update your PIN to continue.'
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
