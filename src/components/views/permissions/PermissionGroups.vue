<template>
  <section>

    <h3 class="text-center">Add/Remove Groups</h3>

    <div>
      <input type="text" class="form-control input-lg" @input="getAvailableGroups()" placeholder="Search for groups to add" v-model="groupSearchText">
    </div>

    <div class="row content-centered">

      <div class="col-sm-5">
        <h3 style="text-align: center;">Available Groups</h3>
      </div>


      <div class="col-sm-5 col-sm-offset-2">
        <h3 style="text-align: center;">Current Groups</h3>
      </div>
    </div>

    <div v-if="loading" class="content content-centered">
      <pulse-loader></pulse-loader>
    </div>

    <div v-show="!loading">
      <div class="row content-centered">

        <div class="col-sm-5">
          <select multiple ref="availablelist" size="10" style="width: 100%;"
                  v-model="selectedAvailableGroups" @change="selectedPermissionGroups = []">
            <option v-for="obj in availableGroups" v-bind:value="obj">
              {{ (obj.group || {}).name }}
            </option>
          </select>
        </div>

        <div class="col-sm-2 content-centered">
          <div>
            <a @click="addGroups()">
              <i class="fa fa-arrow-circle-right fa-3x"></i>
            </a>
            <br/>
            <br/>
            <a @click="removeGroups()">
              <i class="fa fa-arrow-circle-left fa-3x"></i>
            </a>
          </div>
        </div>

        <div class="col-sm-5">
          <select multiple ref="permissionlist" size="10" style="width: 100%;"
                  v-model="selectedPermissionGroups" @change="selectedAvailableGroups = []">
            <option v-for="obj in newPermission.groups" v-bind:value="obj">
              {{ obj.group.name }}
            </option>
          </select>
        </div>

      </div>

      <div>
        <input class="form-control" style="margin-top: 15px" :disabled="true" :placeholder="groupDescription"/>
      </div>


      <div class="row content-centered">

        <div class="col-sm-4">
          <h3 style="text-align: center;">Included</h3>
        </div>

        <div class="col-sm-4">
          <h3 style="text-align: center;">Excluded</h3>
        </div>

        <div class="col-sm-4">
          <h3 style="text-align: center;">Forbidden</h3>
        </div>
      </div>

      <div class="row content-centered">

        <div class="col-sm-4">
          <select multiple ref="includedlist" size="10" style="width: 100%;"
                  v-model="selectedIncludedGroups">
            <option v-for="obj in includedGroups" v-bind:value="obj">
              {{ (obj.group || {}).name }}
            </option>
          </select>
        </div>

        <div class="col-sm-4 content-centered">
          <select multiple ref="excludedlist" size="10" style="width: 100%;"
                  v-model="selectedExcludedGroups">
            <option v-for="obj in excludedGroups" v-bind:value="obj">
              {{ obj.group.name }}
            </option>
          </select>
        </div>

        <div class="col-sm-4">
          <select multiple ref="forbiddenlist" size="10" style="width: 100%;"
                  v-model="selectedForbiddenGroups">
            <option v-for="obj in forbiddenGroups" v-bind:value="obj">
              {{ obj.group.name }}
            </option>
          </select>
        </div>

      </div>

      <div class="row content-centered">

        <div class="col-sm-4" style="margin-top: 15px">
          <div class="row content-centered">
            <div class="col-sm-6 text-right pull-right">
              <button class="btn btn-primary" @click="applyStateToIncluded"
                      :disabled="lodash.isEmpty(selectedIncludedGroups)">Apply</button>
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
            <div class="col-sm-6 text-right pull-right">
              <button class="btn btn-primary" @click="applyStateToExcluded"
                      :disabled="lodash.isEmpty(selectedExcludedGroups)">Apply</button>
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
            <div class="col-sm-6 text-right pull-right">
              <button class="btn btn-primary" @click="applyStateToForbidden"
                      :disabled="lodash.isEmpty(selectedForbiddenGroups)">Apply</button>
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

      <div v-show="newPermission._id" class="py-2 text-center row" style="margin-top: 10px">
        <button class="btn btn-primary" type="submit" @click="updatePermissionGroups" :disabled="!dirty">Update Permission Groups</button>
      </div>
    </div>

  </section>
</template>

<script>
  import _ from 'lodash'
  import { eventBus, permissionService } from '../../../services'
  import { PERMISSION_STATES, EVENTS } from '../../../config'

  export default {
    name: 'PermissionGroups',
    props: ['permission'],
    data () {
      return {
        lodash: _,
        loading: null,
        dirty: false,
        newPermission: _.cloneDeep(this.permission),
        oldPermission: null,
        PERMISSION_STATES: PERMISSION_STATES,
        groupSearchText: null,
        availableGroups: [],
        selectedAvailableGroups: [],
        selectedPermissionGroups: [],
        selectedIncludedGroups: [],
        selectedExcludedGroups: [],
        selectedForbiddenGroups: [],
        includedToState: PERMISSION_STATES.INCLUDED,
        excludedToState: PERMISSION_STATES.EXCLUDED,
        forbiddenToState: PERMISSION_STATES.FORBIDDEN
      }
    },
    watch: {
      selectedIncludedGroups (val) {
        this.selectedPermissionGroups = [].concat(val, this.selectedExcludedGroups, this.selectedForbiddenGroups)
      },
      selectedExcludedGroups (val) {
        this.selectedPermissionGroups = [].concat(val, this.selectedIncludedGroups, this.selectedForbiddenGroups)
      },
      selectedForbiddenGroups (val) {
        this.selectedPermissionGroups = [].concat(val, this.selectedExcludedGroups, this.selectedIncludedGroups)
      },
      permission (val) {
        this.newPermission = _.cloneDeep(val)
        this.newPermission.groups = this.newPermission.groups || []
        this.getAvailableGroups()
        this.dirty = false
      }
    },
    computed: {
      groupDescription () {
        const group = (this.selectedAvailableGroups[0] || {}).group || (this.selectedPermissionGroups[0] || {}).group
        if (group) {
          return group.name + ': ' + group.description
        }

        return 'Select a group to see its description.'
      },
      includedGroups () {
        return this.newPermission.groups.filter((group) => { return group.state === PERMISSION_STATES.INCLUDED })
      },
      excludedGroups () {
        return this.newPermission.groups.filter((group) => { return group.state === PERMISSION_STATES.EXCLUDED })
      },
      forbiddenGroups () {
        return this.newPermission.groups.filter((group) => { return group.state === PERMISSION_STATES.FORBIDDEN })
      }
    },
    methods: {
      getAvailableGroups () {
        this.loading = true
        const permissionGroupIds = this.newPermission.groups.map((object) => { return object.group._id })
        const params = {}
        if (this.groupSearchText) {
          params.$term = this.groupSearchText
          params.$searchFields = ['name']
        }
        if (!_.isEmpty(permissionGroupIds)) {
          // EXPL: Exclude the current permission groups from the list of available groups
          params.$exclude = permissionGroupIds
        }
        return this.$groupRepository.list(params)
          .then((response) => {
            this.loading = false
            this.availableGroups = response.data.docs.map((group) => {
              return { group, state: this.PERMISSION_STATES.INCLUDED }
            })
            this.sortLists()
          })
          .catch((error) => {
            this.loading = false
            console.error('PermissionGroups.getAvailableGroups-error:\n', error)
            this.$snotify.error('There was an error loading the groups', 'Error!')
          })
      },
      addGroups () {
        this.dirty = true
        this.newPermission.groups = this.newPermission.groups.concat(this.selectedAvailableGroups)

        this.availableGroups = this.availableGroups.filter((object) => {
          return !this.selectedAvailableGroups.find((selectedObject) => {
            return selectedObject.group._id === object.group._id
          })
        })

        this.sortLists()
        eventBus.$emit(EVENTS.PERMISSION_GROUPS_UPDATED, this.newPermission.groups)
      },
      removeGroups () {
        this.dirty = true
        this.availableGroups = this.availableGroups.concat(this.selectedPermissionGroups)

        this.newPermission.groups = this.newPermission.groups.filter((object) => {
          return !this.selectedPermissionGroups.find((selectedObject) => {
            return selectedObject.group._id === object.group._id
          })
        })

        this.sortLists()
        eventBus.$emit(EVENTS.PERMISSION_GROUPS_UPDATED, this.newPermission.groups)
      },
      sortLists () {
        this.newPermission.groups.sort((a, b) => { return a.group.name.localeCompare(b.group.name) })

        this.availableGroups.sort((a, b) => { return a.group.name.localeCompare(b.group.name) })
      },
      applyStateToIncluded () {
        this.dirty = true
        for (let group of this.selectedIncludedGroups) {
          group.state = this.includedToState
        }
        this.selectedIncludedGroups = []
        eventBus.$emit(EVENTS.PERMISSION_GROUPS_UPDATED, this.newPermission.groups)
      },
      applyStateToExcluded () {
        this.dirty = true
        for (let group of this.selectedExcludedGroups) {
          group.state = this.excludedToState
        }
        this.selectedExcludedGroups = []
        eventBus.$emit(EVENTS.PERMISSION_GROUPS_UPDATED, this.newPermission.groups)
      },
      applyStateToForbidden () {
        this.dirty = true
        for (let group of this.selectedForbiddenGroups) {
          group.state = this.forbiddenToState
        }
        this.selectedForbiddenGroups = []
        eventBus.$emit(EVENTS.PERMISSION_GROUPS_UPDATED, this.newPermission.groups)
      },
      updatePermissionGroups () {
        permissionService.updatePermissionGroups(this.newPermission._id, this.newPermission.groups, this.oldPermission.groups)
          .then((response) => {
            this.loading = false
            this.dirty = false
            this.oldPermission = _.cloneDeep(this.newPermission)
            eventBus.$emit(EVENTS.PERMISSION_GROUPS_SAVED)
            this.$snotify.success('Permission groups updated', 'Success!')
          })
          .catch((error) => {
            this.loading = false
            console.error('PermissionGroups.updatePermissionGroups-error:', error)
            this.$snotify.error('Update permission groups failed', 'Error!')
          })
      }
    },
    created () {
      this.newPermission.groups = this.newPermission.groups || []
      this.oldPermission = _.cloneDeep(this.newPermission)
      this.getAvailableGroups()
    }
  }
</script>
