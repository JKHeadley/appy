<template>
  <section>
    <div v-if="loading" class="content content-centered">
      <pulse-loader></pulse-loader>
    </div>

    <div v-show="!loading" v-if="ready" class="content">
      <h1 class="text-center">{{newUser.firstName}} {{newUser.lastName}}</h1>

      <h3 class="text-center">User Scope</h3>

      <div class="row content-centered">
        <div class="col-sm-4">
          <select multiple ref="computedScope" size="10" style="width: 100%;"
                  disabled="true">
            <option v-for="scope in computedUserScope">
              {{ scope }}
            </option>
          </select>
        </div>
      </div>

      <ul class="nav nav-tabs">
        <li class="active"><a data-toggle="tab" href="#details">Details</a></li>
        <li><a data-toggle="tab" href="#groups">Groups</a></li>
        <li><a data-toggle="tab" href="#permissions">Permissions</a></li>
        <li><a data-toggle="tab" href="#password">Password</a></li>
      </ul>

      <div class="tab-content content">
        <div id="details" class="tab-pane fade in active">

          <vue-form :state="formstate" @submit.prevent="onSubmit" class="row">

            <div class="col-sm-6">

              <validate auto-label class="form-group" :class="fieldClassName(formstate.firstName)">
                <vue-form-input
                  required
                  v-model="newUser.firstName"
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
                  v-model="newUser.lastName"
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
                  v-model="newUser.email"
                  :formstate="formstate"
                  :type="'email'"
                  :label="'Email:'"
                  :name="'email'"
                  :messages="{ email: 'Please input a valid email', required: 'This field is required', notUnique: 'That email is already in use.' }">
                </vue-form-input>
              </validate>

            </div>

            <div class="col-sm-6">

              <validate auto-label class="form-group" :class="fieldClassName(formstate.role)">
                <label>Role:</label>
                <select name="role" class="form-control" v-model="newUser.role">
                  <option v-for="role in roles" :selected="role._id === newUser.role._id" :value="role">
                    {{ role.name }}
                  </option>
                </select>
              </validate>

              <div class="form-group">
                <label>Active Status:</label>
                <input class="form-control" :disabled="true"
                       :placeholder="newUser.isActive ? 'Activated' : 'Deactivated'"/>
              </div>

              <div class="form-group">
                <label>Enabled Status:</label>
                <input class="form-control" :disabled="true" :placeholder="newUser.isEnabled ? 'Enabled' : 'Disabled'"/>
              </div>

            </div>

            <!--This is a dummy field to facilitate updating the formstate programmatically-->
            <validate class="hide"><input type="text" v-model="userUpdated" name="userUpdated" /></validate>

          </vue-form>

          <div class="py-2 text-center row" style="margin-top: 10px">
            <button class="btn btn-primary" v-if="newUser.isActive" @click="deactivateUser">Deactivate User</button>
            <button class="btn btn-primary" v-else @click="activateUser">Activate User</button>
            <button class="btn btn-primary" v-if="newUser.isEnabled" @click="disableUser">Disable User</button>
            <button class="btn btn-primary" v-else @click="enableUser">Enable User</button>
            <button class="btn btn-primary" @click="deleteUser">Delete User</button>
          </div>

          <div class="py-2 text-center row" style="margin-top: 10px">
            <button class="btn btn-primary" type="submit" @click="updateUser" :disabled="formstate.$pristine || formstate.$invalid">Update User</button>
            <button class="btn btn-primary" type="submit" @click="clearChanges" :disabled="formstate.$pristine">Clear Changes</button>
          </div>


        </div>
        <div id="groups" class="tab-pane fade">
          <user-groups :user="newUser" v-if="!loading"></user-groups>
        </div>
        <div id="permissions" class="tab-pane fade">
          <user-permissions :user="newUser" v-if="!loading"></user-permissions>
        </div>
        <div id="password" class="tab-pane fade">
          <user-password :user="newUser" v-if="!loading"></user-password>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
  import UserGroups from './UserGroups.vue'
  import UserPermissions from './UserPermissions.vue'
  import UserPassword from './UserPassword.vue'
  import { userService, formService, eventBus } from '../../../services'
  import { EVENTS } from '../../../config'

  import _ from 'lodash'

  export default {
    name: 'UserDetails',
    components: {
      UserGroups,
      UserPermissions,
      UserPassword
    },
    data () {
      return {
        ready: false,
        loading: false,
        userUpdated: null,
        EVENTS: EVENTS,
        newUser: {},
        oldUser: {},
        roles: [],
        permissions: [],
        formstate: {}
      }
    },
    computed: {
      computedUserScope () {
        return userService.computeUserScope(this.newUser)
      }
    },
    methods: {
      fieldClassName: formService.fieldClassName,
      emailValidator: formService.emailValidator,
      emailUniqueValidator (email) {
        return formService.emailUniqueValidator(email, this.oldUser.email)
      },
      getUser () {
        this.loading = true
        const params = {
          $embed: ['role.permissions', 'groups.permissions', 'permissions']
        }
        const promises = []
        let promise = {}

        promise = this.$userRepository.find(this.$route.params._id, params)
          .then((response) => {
            this.newUser = response.data
            this.oldUser = _.cloneDeep(this.newUser)
            this.$store.dispatch('setBreadcrumbTitle', this.newUser.firstName + ' ' + this.newUser.lastName)
          })
        promises.push(promise)
        return Promise.all(promises)
          .then(() => {
            this.loading = false
          })
      },
      getRoles () {
        return this.$roleRepository.list({ $embed: ['permissions'] })
          .then((response) => {
            this.roles = response.data.docs
          })
      },
      clearChanges () {
        this.newUser = _.cloneDeep(this.oldUser)
        this.formstate._reset()
      },
      updateUser () {
        this.loading = true
        return userService.updateUser(this.newUser, this.oldUser)
          .then((response) => {
            this.loading = false
            this.formstate._reset()
            this.oldUser = _.cloneDeep(this.newUser)
            this.$snotify.success('User updated', 'Success!')
          })
          .catch((error) => {
            this.loading = false
            console.error('UserDetails.updateUser-error:', error)
            this.$snotify.error('Update user failed', 'Error!')
          })
      },
      deleteUser () {
        this.loading = true
        return this.$userRepository.deleteOne(this.newUser._id)
          .then((response) => {
            this.loading = false
            this.$snotify.success('User deleted', 'Success!')
            this.$router.push('/users')
          })
          .catch((error) => {
            this.loading = false
            console.error('UserDetails.deleteUser-error:', error)
            this.$snotify.error('Delete user failed', 'Error!')
          })
      },
      disableUser () {
        this.loading = true
        return userService.disableUser(this.newUser)
          .then((response) => {
            this.newUser.isEnabled = false
            this.loading = false
            this.$snotify.success('User disabled', 'Success!')
          })
          .catch((error) => {
            this.loading = false
            console.error('UserDetails.disableUser-error:', error)
            this.$snotify.error('Disable user failed', 'Error!')
          })
      },
      enableUser () {
        this.loading = true
        return userService.enableUser(this.newUser)
          .then((response) => {
            this.newUser.isEnabled = true
            this.loading = false
            this.$snotify.success('User enabled', 'Success!')
          })
          .catch((error) => {
            this.loading = false
            console.error('UserDetails.enableUser-error:', error)
            this.$snotify.error('Enable user failed', 'Error!')
          })
      },
      deactivateUser () {
        this.loading = true
        return userService.deactivateUser(this.newUser)
          .then((response) => {
            this.newUser.isActive = false
            this.loading = false
            this.$snotify.success('User deactivated', 'Success!')
          })
          .catch((error) => {
            this.loading = false
            console.error('UserDetails.deactivateUser-error:', error)
            this.$snotify.error('Deactivate user failed', 'Error!')
          })
      },
      activateUser () {
        this.loading = true
        return userService.activateUser(this.newUser)
          .then((response) => {
            this.newUser.isActive = true
            this.loading = false
            this.$snotify.success('User activated', 'Success!')
          })
          .catch((error) => {
            this.loading = false
            console.error('UserDetails.activateUser-error:', error)
            this.$snotify.error('Activate user failed', 'Error!')
          })
      }
    },
    created () {
      const promises = []
      promises.push(this.getUser())
      promises.push(this.getRoles())
      Promise.all(promises)
        .then(() => {
          this.loading = false
          this.ready = true
        })
      eventBus.$on(EVENTS.GROUPS_UPDATED, (newGroups) => {
        this.newUser.groups = newGroups
        this.formstate.userUpdated._setDirty()
      })
      eventBus.$on(EVENTS.PERMISSIONS_UPDATED, (newPermissions) => {
        this.newUser.permissions = newPermissions
        this.formstate.userUpdated._setDirty()
      })
    }
  }
</script>
