<template>
  <section>

    <h3 class="text-center">Add/Remove Groups</h3>

    <div>
      <input type="text" class="form-control input-lg" @input="getAvailableGroups()" placeholder="Search for groups to add" v-model="groupSearchText">
    </div>

    <div v-if="loading" class="content content-centered">
      <pulse-loader></pulse-loader>
    </div>

    <div v-show="!loading">
      <div class="row content-centered" style="margin-top: 15px;">

        <div class="col-sm-5">
          <div class="box box-info box-solid">
            <div class="box-header">
              <h3 class="box-title" style="text-align: center;">Available Groups</h3>
            </div>
            <div class="box-body">
              <select multiple ref="availablelist" size="10" style="width: 100%;"
                      v-model="selectedAvailableGroups" @change="selectedUserGroups = []">
                <option v-for="obj in availableGroups" v-bind:value="obj">
                  {{ (obj.group || {}).name }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div class="col-sm-2 content-centered">
          <div>
            <a @click="addGroups()">
              <i class="fa fa-arrow-circle-right fa-3x icon-btn icon-btn-primary"></i>
            </a>
            <br/>
            <br/>
            <a @click="removeGroups()">
              <i class="fa fa-arrow-circle-left fa-3x icon-btn icon-btn-info"></i>
            </a>
          </div>
        </div>

        <div class="col-sm-5">
          <div class="box box-primary box-solid">
            <div class="box-header">
              <h3 class="box-title">Current Groups</h3>
            </div>
            <div class="box-body">
              <select multiple ref="userlist" size="10" style="width: 100%;"
                      v-model="selectedUserGroups" @change="selectedAvailableGroups = []">
                <option v-for="obj in newUser.groups" v-bind:value="obj">
                  {{ obj.group.name }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div>
        <input class="form-control" style="margin-top: 15px" :disabled="true" :placeholder="groupDescription"/>
      </div>

      <div v-show="newUser._id" class="py-2 text-center row" style="margin-top: 10px">
        <button class="btn btn-primary" type="submit" @click="updateUserGroups" :disabled="!dirty"
                v-permission.enable="['user', 'addUserGroups', 'removeUserGroups',
                'addUserAssociations', 'removeUserAssociations']">Update User Groups</button>
      </div>
    </div>

  </section>
</template>

<script>
  import { userService, eventBus } from '../../../services'
  import { EVENTS } from '../../../config'

  import _ from 'lodash'

  export default {
    name: 'UserGroups',
    props: ['user'],
    data () {
      return {
        loading: null,
        dirty: false,
        newUser: _.cloneDeep(this.user),
        oldUser: null,
        groupSearchText: null,
        availableGroups: [],
        selectedAvailableGroups: [],
        selectedUserGroups: []
      }
    },
    watch: {
      user (val) {
        this.newUser = _.cloneDeep(val)
        this.newUser.groups = this.newUser.groups || []
        this.getAvailableGroups()
        this.dirty = false
      }
    },
    computed: {
      groupDescription () {
        const group = (this.selectedAvailableGroups[0] || {}).group || (this.selectedUserGroups[0] || {}).group
        if (group) {
          return group.name + ': ' + group.description
        }

        return 'Select a group to see its description.'
      }
    },
    methods: {
      getAvailableGroups () {
        this.loading = true
        const userGroupIds = this.newUser.groups.map((object) => { return object.group._id })
        const params = {}
        if (this.groupSearchText) {
          params.$term = this.groupSearchText
          params.$searchFields = ['name']
        }
        if (!_.isEmpty(userGroupIds)) {
          params.$exclude = userGroupIds
        }
        params.$embed = ['permissions']
        return this.$groupRepository.list(params)
          .then((response) => {
            this.loading = false
            this.availableGroups = response.data.docs.map((group) => { return {group} })
            this.sortLists()
          })
          .catch((error) => {
            this.loading = false
            console.error('UserGroups.getAvailableGroups-error:\n', error)
            this.$snotify.error('There was an error loading the groups', 'Error!')
          })
      },
      addGroups () {
        this.dirty = true
        this.newUser.groups = this.newUser.groups.concat(this.selectedAvailableGroups)

        this.availableGroups = this.availableGroups.filter((object) => {
          return !this.selectedAvailableGroups.find((selectedObject) => {
            return selectedObject.group._id === object.group._id
          })
        })

        this.selectedAvailableGroups = []
        this.sortLists()
        eventBus.$emit(EVENTS.USER_GROUPS_UPDATED, this.newUser.groups)
      },
      removeGroups () {
        this.dirty = true
        this.availableGroups = this.availableGroups.concat(this.selectedUserGroups)

        this.newUser.groups = this.newUser.groups.filter((object) => {
          return !this.selectedUserGroups.find((selectedObject) => {
            return selectedObject.group._id === object.group._id
          })
        })

        this.selectedUserGroups = []
        this.sortLists()
        eventBus.$emit(EVENTS.USER_GROUPS_UPDATED, this.newUser.groups)
      },
      sortLists () {
        this.newUser.groups.sort((a, b) => { return a.group.name.localeCompare(b.group.name) })

        this.availableGroups.sort((a, b) => { return a.group.name.localeCompare(b.group.name) })
      },
      updateUserGroups () {
        userService.updateUserGroups(this.newUser._id, this.newUser.groups, this.oldUser.groups)
          .then((response) => {
            this.loading = false
            this.dirty = false
            this.oldUser = _.cloneDeep(this.newUser)
            eventBus.$emit(EVENTS.USER_GROUPS_SAVED)
            this.$snotify.success('User groups updated', 'Success!')
          })
          .catch((error) => {
            this.loading = false
            console.error('UserGroups.updateUserGroups-error:', error)
            this.$snotify.error('Update user groups failed', 'Error!')
          })
      }
    },
    created () {
      this.newUser.groups = this.newUser.groups || []
      this.oldUser = _.cloneDeep(this.newUser)
      this.getAvailableGroups()
    }
  }
</script>