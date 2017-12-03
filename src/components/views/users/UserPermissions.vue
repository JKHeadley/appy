<template>
  <section>

    <h3 class="text-center">Add/Remove Permissions</h3>

    <div>
      <input type="text" class="form-control input-lg" @input="getAvailablePermissions()" placeholder="Search for permissions to add" v-model="permissionSearchText">
    </div>

    <div class="row content-centered">

      <div class="col-sm-5">
        <h3 style="text-align: center;">Available Permissions</h3>
      </div>


      <div class="col-sm-5 col-sm-offset-2">
        <h3 style="text-align: center;">Current Permissions</h3>
      </div>
    </div>

    <div v-if="loading" class="content content-centered">
      <pulse-loader></pulse-loader>
    </div>

    <div v-show="!loading">
      <div class="row content-centered">

        <div class="col-sm-5">
          <select multiple ref="availablelist" size="10" style="width: 100%;"
                  v-model="selectedAvailablePermissions" @change="selectedUserPermissions = []">
            <option v-for="obj in availablePermissions" v-bind:value="obj">
              {{ (obj.permission || {}).name }}
            </option>
          </select>
        </div>

        <div class="col-sm-2 content-centered">
          <div>
            <a @click="addPermissions()">
              <i class="fa fa-arrow-circle-right fa-3x"></i>
            </a>
            <br/>
            <br/>
            <a @click="removePermissions()">
              <i class="fa fa-arrow-circle-left fa-3x"></i>
            </a>
          </div>
        </div>

        <div class="col-sm-5">
          <select multiple ref="userlist" size="10" style="width: 100%;"
                  v-model="selectedUserPermissions" @change="selectedAvailablePermissions = []">
            <option v-for="obj in userPermissions" v-bind:value="obj">
              {{ obj.permission.name }}
            </option>
          </select>
        </div>

      </div>

      <div>
        <input class="form-control" style="margin-top: 15px" :disabled="true" :placeholder="permissionDescription"/>
      </div>


      <div class="row content-centered">

        <div class="col-sm-4">
          <h3 style="text-align: center;">Included Permissions</h3>
        </div>

        <div class="col-sm-4">
          <h3 style="text-align: center;">Excluded Permissions</h3>
        </div>

        <div class="col-sm-4">
          <h3 style="text-align: center;">Forbidden Permissions</h3>
        </div>
      </div>

      <div class="row content-centered">

        <div class="col-sm-4">
          <select multiple ref="includedlist" size="10" style="width: 100%;"
                  v-model="selectedIncludedPermissions">
            <option v-for="obj in includedPermissions" v-bind:value="obj">
              {{ (obj.permission || {}).name }}
            </option>
          </select>
        </div>

        <div class="col-sm-4 content-centered">
          <select multiple ref="excludedlist" size="10" style="width: 100%;"
                  v-model="selectedExcludedPermissions">
            <option v-for="obj in excludedPermissions" v-bind:value="obj">
              {{ obj.permission.name }}
            </option>
          </select>
        </div>

        <div class="col-sm-4">
          <select multiple ref="forbiddenlist" size="10" style="width: 100%;"
                  v-model="selectedForbiddenPermissions">
            <option v-for="obj in forbiddenPermissions" v-bind:value="obj">
              {{ obj.permission.name }}
            </option>
          </select>
        </div>

      </div>

      <div class="row content-centered">

        <div class="col-sm-4" style="margin-top: 15px">
          <div class="row content-centered">
            <div class="col-sm-6 text-right content-centered">
              <button class="btn btn-primary" @click="applyStateToIncluded"
                      :disabled="lodash.isEmpty(selectedIncludedPermissions)">Apply State</button>
            </div>
            <div class="col-sm-6">
              <input type="radio" id="includedToState_included" :value="PERMISSION_STATES.INCLUDED" v-model="includedToState">
              <label for="includedToState_included">{{ PERMISSION_STATES.INCLUDED }}</label>
              <br>
              <input type="radio" id="includedToState_excluded" :value="PERMISSION_STATES.EXCLUDED" v-model="includedToState">
              <label for="includedToState_excluded">{{ PERMISSION_STATES.EXCLUDED }}</label>
              <br>
              <input type="radio" id="includedToState_forbidden" :value="PERMISSION_STATES.FORBIDDEN" v-model="includedToState">
              <label for="includedToState_forbidden">{{ PERMISSION_STATES.FORBIDDEN }}</label>
              <br>
            </div>
          </div>
        </div>

        <div class="col-sm-4" style="margin-top: 15px">
          <div class="row content-centered">
            <div class="col-sm-6 text-right content-centered">
              <button class="btn btn-primary" @click="applyStateToExcluded"
                      :disabled="lodash.isEmpty(selectedExcludedPermissions)">Apply State</button>
            </div>
            <div class="col-sm-6">
              <input type="radio" id="excludedToState_included" :value="PERMISSION_STATES.INCLUDED" v-model="excludedToState">
              <label for="excludedToState_included">{{ PERMISSION_STATES.INCLUDED }}</label>
              <br>
              <input type="radio" id="excludedToState_excluded" :value="PERMISSION_STATES.EXCLUDED" v-model="excludedToState">
              <label for="excludedToState_excluded">{{ PERMISSION_STATES.EXCLUDED }}</label>
              <br>
              <input type="radio" id="excludedToState_forbidden" :value="PERMISSION_STATES.FORBIDDEN" v-model="excludedToState">
              <label for="excludedToState_forbidden">{{ PERMISSION_STATES.FORBIDDEN }}</label>
              <br>
            </div>
          </div>
        </div>

        <div class="col-sm-4" style="margin-top: 15px">
          <div class="row content-centered">
            <div class="col-sm-6 text-right content-centered">
              <button class="btn btn-primary" @click="applyStateToForbidden"
                      :disabled="lodash.isEmpty(selectedForbiddenPermissions)">Apply State</button>
            </div>
            <div class="col-sm-6">
              <input type="radio" id="forbiddenToState_included" :value="PERMISSION_STATES.INCLUDED" v-model="forbiddenToState">
              <label for="forbiddenToState_included">{{ PERMISSION_STATES.INCLUDED }}</label>
              <br>
              <input type="radio" id="forbiddenToState_excluded" :value="PERMISSION_STATES.EXCLUDED" v-model="forbiddenToState">
              <label for="forbiddenToState_excluded">{{ PERMISSION_STATES.EXCLUDED }}</label>
              <br>
              <input type="radio" id="forbiddenToState_forbidden" :value="PERMISSION_STATES.FORBIDDEN" v-model="forbiddenToState">
              <label for="forbiddenToState_forbidden">{{ PERMISSION_STATES.FORBIDDEN }}</label>
              <br>
            </div>
          </div>
        </div>

      </div>

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

      <div class="py-2 text-center content row">
        <button class="btn btn-primary" ref="updateUserPermissions" :disabled="true" @click="updateUserPermissions">Update User</button>
      </div>
    </div>

  </section>
</template>

<script>
  import _ from 'lodash'
  import { userService, eventBus } from '../../../services'
  import { PERMISSION_STATES, EVENTS } from '../../../config'

  export default {
    name: 'UserPermissions',
    props: ['user', 'userScope'],
    data () {
      return {
        lodash: _,
        loading: null,
        PERMISSION_STATES: PERMISSION_STATES,
        permissionSearchText: null,
        availablePermissions: [],
        selectedAvailablePermissions: [],
        selectedUserPermissions: [],
        selectedIncludedPermissions: [],
        selectedExcludedPermissions: [],
        selectedForbiddenPermissions: [],
        includedToState: PERMISSION_STATES.INCLUDED,
        excludedToState: PERMISSION_STATES.EXCLUDED,
        forbiddenToState: PERMISSION_STATES.FORBIDDEN,
        userPermissions: this.user.permissions
      }
    },
    watch: {
      selectedIncludedPermissions (val) {
        this.selectedUserPermissions = [].concat(val, this.selectedExcludedPermissions, this.selectedForbiddenPermissions)
      },
      selectedExcludedPermissions (val) {
        this.selectedUserPermissions = [].concat(val, this.selectedIncludedPermissions, this.selectedForbiddenPermissions)
      },
      selectedForbiddenPermissions (val) {
        this.selectedUserPermissions = [].concat(val, this.selectedExcludedPermissions, this.selectedIncludedPermissions)
      }
    },
    computed: {
      permissionDescription () {
        const permission = (this.selectedAvailablePermissions[0] || {}).permission || (this.selectedUserPermissions[0] || {}).permission
        if (permission) {
          return permission.name + ': ' + permission.description
        }

        return 'Select a permission to see its description.'
      },
      includedPermissions () {
        return this.userPermissions.filter((permission) => { return permission.state === PERMISSION_STATES.INCLUDED })
      },
      excludedPermissions () {
        return this.userPermissions.filter((permission) => { return permission.state === PERMISSION_STATES.EXCLUDED })
      },
      forbiddenPermissions () {
        return this.userPermissions.filter((permission) => { return permission.state === PERMISSION_STATES.FORBIDDEN })
      },
      computedUserScope () {
        return userService.computeUserScope(this.user, this.user.role, this.user.groups, this.userPermissions)
      }
    },
    methods: {
      getAvailablePermissions () {
        this.loading = true
        const userPermissionIds = this.userPermissions.map((object) => { return object.permission._id })
        const params = {}
        if (this.permissionSearchText) {
          params.$term = this.permissionSearchText
          params.$searchFields = ['name']
        }
        if (!_.isEmpty(userPermissionIds)) {
          // EXPL: Exclude the current user permissions from the list of available permissions
          params.$exclude = userPermissionIds
        }
        return this.$permissionRepository.list(params)
          .then((response) => {
            this.loading = false
            this.availablePermissions = response.data.docs.map((permission) => {
              return { permission, state: this.PERMISSION_STATES.INCLUDED }
            })
            this.sortLists()
          })
          .catch((error) => {
            console.error('UserPermissions.getAvailablePermissions-error:\n', error)
            this.$snotify.error('There was an error loading the permissions', 'Error!')
          })
      },
      addPermissions () {
        this.$refs.updateUserPermissions.disabled = false
        this.userPermissions = this.userPermissions.concat(this.selectedAvailablePermissions)

        this.availablePermissions = this.availablePermissions.filter((object) => {
          return !this.selectedAvailablePermissions.find((selectedObject) => {
            return selectedObject.permission._id === object.permission._id
          })
        })

        this.sortLists()
      },
      removePermissions () {
        this.$refs.updateUserPermissions.disabled = false
        this.availablePermissions = this.availablePermissions.concat(this.selectedUserPermissions)

        this.userPermissions = this.userPermissions.filter((object) => {
          return !this.selectedUserPermissions.find((selectedObject) => {
            return selectedObject.permission._id === object.permission._id
          })
        })

        this.sortLists()
      },
      sortLists () {
        this.userPermissions.sort((a, b) => { return a.permission.name.localeCompare(b.permission.name) })

        this.availablePermissions.sort((a, b) => { return a.permission.name.localeCompare(b.permission.name) })
      },
      updateUserPermissions () {
        this.loading = true
        userService.updateUserPermissions(this.user, this.userPermissions)
          .then((response) => {
            this.loading = false
            eventBus.$emit(EVENTS.USER_UPDATED)
            this.$refs.updateUserPermissions.disabled = true
            this.user.permissions = this.userPermissions
            this.$snotify.success('User updated', 'Success!')
          })
          .catch((error) => {
            this.loading = false
            console.error('UserPermissions.updateUserPermissions-error:', error)
            this.$snotify.error('Update user failed', 'Error!')
          })
      },
      applyStateToIncluded () {
        for (let permission of this.selectedIncludedPermissions) {
          permission.state = this.includedToState
        }
        this.selectedIncludedPermissions = []
      },
      applyStateToExcluded () {
        for (let permission of this.selectedExcludedPermissions) {
          permission.state = this.excludedToState
        }
        this.selectedExcludedPermissions = []
      },
      applyStateToForbidden () {
        for (let permission of this.selectedForbiddenPermissions) {
          permission.state = this.forbiddenToState
        }
        this.selectedForbiddenPermissions = []
      }
    },
    created () {
      this.getAvailablePermissions()
    }
  }
</script>
