<template>
  <section>
    <div v-if="loading" class="content content-centered">
      <pulse-loader></pulse-loader>
    </div>

    <div v-show="!loading" v-if="ready" class="content">
      <h1 class="text-center">{{user.firstName}} {{user.lastName}}</h1>

      <ul class="nav nav-tabs">
        <li class="active"><a data-toggle="tab" href="#details">Details</a></li>
        <li><a data-toggle="tab" href="#groups">Groups</a></li>
        <li><a data-toggle="tab" href="#permissions">Permissions</a></li>
      </ul>

      <div class="tab-content content">
        <div id="details" class="tab-pane fade in active">

          <vue-form :state="formstate" @submit.prevent="onSubmit" class="row">

            <div class="col-sm-6">

              <validate auto-label class="form-group" :class="fieldClassName(formstate.firstName)">
                <vue-form-input
                  required
                  v-model="user.firstName"
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
                  v-model="user.lastName"
                  :formstate="formstate"
                  :type="'text'"
                  :label="'Last Name:'"
                  :name="'lastName'"
                  :messages="{ required: 'This field is required' }">
                </vue-form-input>
              </validate>

              <validate auto-label class="form-group" :class="fieldClassName(formstate.email)" :custom="{ email: emailValidator }">
                <vue-form-input
                  required
                  v-model="user.email"
                  :formstate="formstate"
                  :type="'email'"
                  :label="'Email:'"
                  :name="'email'"
                  :messages="{ email: 'Please input a valid email', required: 'This field is required' }">
                </vue-form-input>
              </validate>

            </div>

            <div class="col-sm-6">

              <validate auto-label class="form-group" :class="fieldClassName(formstate.role)">
                <label>Role:</label>
                <select name="role" class="form-control" v-model="selectedRole">
                  <option v-for="role in roles" :selected="role._id === selectedRole._id" :value="role">
                    {{ role.name }}
                  </option>
                </select>
              </validate>

              <div class="form-group">
                <label>Active Status:</label>
                <input class="form-control" :disabled="true"
                       :placeholder="user.isActive ? 'Activated' : 'Deactivated'"/>
              </div>

              <div class="form-group">
                <label>Enabled Status:</label>
                <input class="form-control" :disabled="true" :placeholder="user.isEnabled ? 'Enabled' : 'Disabled'"/>
              </div>

            </div>

          </vue-form>

          <h3 class="text-center">Computed User Scope</h3>

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

          <div class="py-2 text-center row">
            <button class="btn btn-primary" type="submit" @click="updateUser" :disabled="formstate.$pristine || formstate.$invalid">Update</button>
            <button class="btn btn-primary" v-if="user.isActive" @click="deactivateUser">Deactivate</button>
            <button class="btn btn-primary" v-else @click="activateUser">Activate</button>
            <button class="btn btn-primary" v-if="user.isEnabled" @click="disableUser">Disable</button>
            <button class="btn btn-primary" v-else @click="enableUser">Enable</button>
            <button class="btn btn-primary" @click="deleteUser">Delete</button>
          </div>


        </div>
        <div id="groups" class="tab-pane fade">
          <user-groups :user="user" :userScope="userScope" v-if="!loading"></user-groups>
        </div>
        <div id="permissions" class="tab-pane fade">
          <user-permissions :user="user" :userScope="userScope" v-if="!loading"></user-permissions>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
  import UserGroups from './UserGroups.vue'
  import UserPermissions from './UserPermissions.vue'
  import { userService, formService, eventBus } from '../../../services'
  import { EVENTS } from '../../../config'

  import _ from 'lodash'

  export default {
    name: 'UserDetails',
    components: {
      UserGroups,
      UserPermissions
    },
    data () {
      return {
        ready: false,
        loading: false,
        EVENTS: EVENTS,
        user: {},
        selectedRole: {},
        userScope: [],
        roles: [],
        permissions: [],
        formstate: {}
      }
    },
    computed: {
      computedUserScope: {
        cache: false,
        get () {
          return userService.computeUserScope(this.user, this.selectedRole, this.user.groups, this.user.permissions)
        }
      }
    },
    methods: {
      emailValidator: formService.emailValidator,
      fieldClassName: formService.fieldClassName,
      onSubmit () {
        console.log(this.formstate.$valid)
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
            this.user = response.data
            this.$store.dispatch('setBreadcrumbTitle', this.user.firstName + ' ' + this.user.lastName)
          })
        promises.push(promise)
        promises.push(this.getUserScope())
        return Promise.all(promises)
          .then(() => {
            this.loading = false
          })
      },
      getUserScope () {
        return userService.getUserScope(this.$route.params._id)
          .then((response) => {
            this.userScope = response.data
          })
          .catch((error) => {
            console.error('UserPermissions.getUserScope-error:\n', error)
            this.$snotify.error('There was an error loading the user scope', 'Error!')
          })
      },
      getRoles () {
        return this.$roleRepository.list({ $embed: ['permissions'] })
          .then((response) => {
            this.roles = response.data.docs
          })
      },
      updateUser () {
        this.loading = true
        const userData = _.clone(this.user)
        userData.role = this.selectedRole._id
        return userService.updateUser(userData)
          .then((response) => {
            this.loading = false
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
        return this.$userRepository.deleteOne(this.user._id)
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
        return userService.disableUser(this.user)
          .then((response) => {
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
        return userService.enableUser(this.user)
          .then((response) => {
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
        return userService.deactivateUser(this.user)
          .then((response) => {
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
        return userService.activateUser(this.user)
          .then((response) => {
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
          this.selectedRole = this.roles.find((role) => { return role._id === this.user.role._id })
        })
      eventBus.$on(EVENTS.USER_UPDATED, this.getUser)
    }
  }
</script>
