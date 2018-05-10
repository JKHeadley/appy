<template>
  <section>
    <div v-if="loading" class="content content-centered">
      <pulse-loader></pulse-loader>
    </div>

    <div v-show="!loading" v-if="ready" class="content">
      <div class="box box-primary box-solid">
        <div class="box-body">

          <div class="row">
            <div class="flash-message col-md-4 col-md-offset-4 text-center" v-if="flash">
              <div class="alert" :class="'alert-' + flashType">{{ flashMessage }}</div>
            </div>
          </div>

          <div class="row content-centered">
            <div class="col-sm-4">
              <div class="box box-success box-solid">
                <div class="box-header">
                  <h3 class="box-title">User Scope</h3>
                </div>
                <div class="box-body">
                  <select multiple ref="computedScope" size="10" style="width: 100%;"
                          disabled="true">
                    <option v-for="scope in computedUserScope">
                      {{ scope }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>

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
                <select name="role" class="form-control" v-model="user.role">
                  <option v-for="role in roles" :selected="role._id === user.role._id" :value="role">
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

          <div class="py-2 text-center row" style="margin-top: 10px">
            <button class="btn btn-primary" type="submit" @click="createUser" :disabled="!(formstate.$dirty && formstate.$valid)">Create User</button>
          </div>

          <div class="text-center row" style="margin-top: 10px">
            <span><strong>Note</strong>: An invitation will be sent to the user's email address.</span>
          </div>


        </div>
        <div id="groups" class="tab-pane fade">
          <user-groups :user="user" v-if="!loading"></user-groups>
        </div>
        <div id="permissions" class="tab-pane fade">
          <user-permissions :user="user" v-if="!loading"></user-permissions>
        </div>
      </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
  import UserGroups from './UserGroups.vue'
  import UserPermissions from './UserPermissions.vue'
  import { userService, authService, formService, eventBus } from '../../../services'
  import { EVENTS, USER_ROLES } from '../../../config'

  export default {
    name: 'UserCreate',
    components: {
      UserGroups,
      UserPermissions
    },
    data () {
      return {
        ready: false,
        loading: false,
        flash: false,
        flashType: null,
        flashMessage: '',
        EVENTS: EVENTS,
        USER_ROLES: USER_ROLES,
        user: null,
        roles: [],
        permissions: [],
        formstate: {}
      }
    },
    computed: {
      computedUserScope () {
        return userService.computeUserScope(this.user)
      }
    },
    methods: {
      emailValidator: formService.emailValidator,
      fieldClassName: formService.fieldClassName,
      getRoles () {
        return this.$roleRepository.list({ $embed: ['permissions'] })
          .then((response) => {
            this.roles = response.data.docs
          })
          .catch((error) => {
            console.error('UserCreate.getRoles-error:', error)
            this.$snotify.error('Get roles failed', 'Error!')
          })
      },
      createUser () {
        this.loading = true
        return authService.inviteUser(this.user)
          .then((response) => {
            this.loading = false
            this.$snotify.success('User created', 'Success!')
            this.$router.push('/users')
          })
          .catch((error) => {
            this.loading = false
            console.error('UserCreate.createUser-error:', error)
            this.$snotify.error('Create user failed', 'Error!')
          })
      },
      updateGroups (groups) {
        this.user.groups = groups
      },
      updatePermissions (permissions) {
        this.user.permissions = permissions
      }
    },
    created () {
      const promises = []
      this.loading = true
      promises.push(this.getRoles())
      Promise.all(promises)
        .then(() => {
          this.loading = false
          this.ready = true
          this.user = {
            isActive: false,
            isEnabled: true,
            role: this.roles.find((role) => { return role.name === USER_ROLES.USER }),
            groups: [],
            permissions: []
          }
          if (!this.user.role) {
            this.flash = true
            this.flashType = 'error'
            this.flashMessage = 'User role not found, please make sure the role values in the client and ' +
              'server configs are the same.'
            this.user.role = { permissions: [] }
          }
        })
        .catch(() => {
          this.loading = false
        })
      eventBus.$on(EVENTS.USER_GROUPS_UPDATED, this.updateGroups)
      eventBus.$on(EVENTS.USER_PERMISSIONS_UPDATED, this.updatePermissions)
    },
    beforeDestroy () {
      eventBus.$off(EVENTS.USER_GROUPS_UPDATED, this.updateGroups)
      eventBus.$off(EVENTS.USER_PERMISSIONS_UPDATED, this.updatePermissions)
    }
  }
</script>