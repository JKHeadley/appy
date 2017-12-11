<template>
  <section>
    <div v-if="loading" class="content content-centered">
      <pulse-loader></pulse-loader>
    </div>

    <div v-show="!loading" class="content">
      <h1 class="text-center">Profile</h1>

      <ul class="nav nav-tabs">
        <li class="active"><a data-toggle="tab" href="#details">Details</a></li>
        <li><a data-toggle="tab" href="#groups">Picture</a></li>
      </ul>

      <div class="tab-content content">
        <div id="details" class="tab-pane fade in active">

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

          </vue-form>

          <div class="py-2 text-center row" style="margin-top: 10px">
            <button class="btn btn-primary" type="submit" @click="updateProfile" :disabled="formstate.$pristine || formstate.$invalid">Update Profile</button>
            <button class="btn btn-primary" type="submit" @click="clearChanges" :disabled="formstate.$pristine">Clear Changes</button>
          </div>

          <div class="py-2 text-center row" style="margin-top: 10px">
            <button class="btn btn-danger" @click="deleteUserModal">Delete Account</button>
          </div>

        </div>
        <div id="picture" class="tab-pane fade">
          <!--<user-groups :user="newProfile" v-if="!loading"></user-groups>-->
        </div>
      </div>
    </div>
  </section>
</template>

<script>
  import { userService, authService, formService } from '../../../services'

  import _ from 'lodash'

  export default {
    name: 'UserProfile',
    data () {
      return {
        ready: false,
        loading: false,
        userUpdated: null,
        newProfile: {},
        oldProfile: {},
        roles: [],
        permissions: [],
        formstate: {}
      }
    },
    methods: {
      fieldClassName: formService.fieldClassName,
      emailValidator: formService.emailValidator,
      emailUniqueValidator (email) {
        return formService.emailUniqueValidator(email, this.oldProfile.email)
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
            // EXPL: Update the global user object
            const user = Object.assign(this.$store.state.auth.user, this.newProfile)
            this.$store.commit('auth/SET_USER', user)
            this.$snotify.success('Profile updated', 'Success!')
          })
          .catch((error) => {
            this.loading = false
            console.error('UserProfile.updateProfile-error:', error)
            this.$snotify.error('Update profile failed', 'Error!')
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
      },
      deactivateUser () {
        this.loading = true
        return userService.deactivateUser(this.newProfile)
          .then((response) => {
            this.newProfile.isActive = false
            this.loading = false
            this.$snotify.success('User deactivated', 'Success!')
          })
          .catch((error) => {
            this.loading = false
            console.error('UserDetails.deactivateUser-error:', error)
            this.$snotify.error('Deactivate user failed', 'Error!')
          })
      },
    },
    created () {
      // EXPL: filter out unneeded user properties for the profile
      this.newProfile = (({ email, firstName, lastName }) => {
        return { email, firstName, lastName }
      })(this.$store.state.auth.user)
      this.oldProfile = _.cloneDeep(this.newProfile)
    }
  }
</script>
