<template>
  <section>

    <h3 class="text-center">Add/Remove Users</h3>

    <div>
      <input type="text" class="form-control input-lg" @input="getAvailableUsers()" placeholder="Search for users to add" v-model="userSearchText">
    </div>

    <div class="row content-centered">

      <div class="col-sm-5">
        <h3 style="text-align: center;">Available Users</h3>
      </div>


      <div class="col-sm-5 col-sm-offset-2">
        <h3 style="text-align: center;">Current Users</h3>
      </div>
    </div>

    <div v-if="loading" class="content content-centered">
      <pulse-loader></pulse-loader>
    </div>

    <div v-show="!loading">
      <div class="row content-centered">

        <div class="col-sm-5">
          <select multiple ref="availablelist" size="10" style="width: 100%;"
                  v-model="selectedAvailableUsers" @change="selectedGroupUsers = []">
            <option v-for="obj in availableUsers" v-bind:value="obj">
              {{ (obj.user || {}).lastName }}, {{ (obj.user || {}).firstName }}
            </option>
          </select>
        </div>

        <div class="col-sm-2 content-centered">
          <div>
            <a @click="addUsers()">
              <i class="fa fa-arrow-circle-right fa-3x"></i>
            </a>
            <br/>
            <br/>
            <a @click="removeUsers()">
              <i class="fa fa-arrow-circle-left fa-3x"></i>
            </a>
          </div>
        </div>

        <div class="col-sm-5">
          <select multiple ref="grouplist" size="10" style="width: 100%;"
                  v-model="selectedGroupUsers" @change="selectedAvailableUsers = []">
            <option v-for="obj in newGroup.users" v-bind:value="obj">
              {{ obj.user.lastName }}, {{ obj.user.firstName }}
            </option>
          </select>
        </div>

      </div>

      <div>
        <input class="form-control" style="margin-top: 15px" :disabled="true" :placeholder="userDescription"/>
      </div>

      <div v-show="newGroup._id" class="py-2 text-center row" style="margin-top: 10px">
        <button class="btn btn-primary" type="submit" @click="updateGroupUsers" :disabled="!dirty">Update Group Users</button>
      </div>
    </div>

  </section>
</template>

<script>
  import _ from 'lodash'
  import { eventBus, groupService } from '../../../services'
  import { EVENTS } from '../../../config'

  export default {
    name: 'GroupUsers',
    props: ['group'],
    data () {
      return {
        lodash: _,
        loading: null,
        dirty: false,
        newGroup: _.cloneDeep(this.group),
        oldGroup: null,
        userSearchText: null,
        availableUsers: [],
        selectedAvailableUsers: [],
        selectedGroupUsers: []
      }
    },
    watch: {
      group (val) {
        this.newGroup = _.cloneDeep(val)
        this.newGroup.users = this.newGroup.users || []
        this.getAvailableUsers()
        this.dirty = false
      }
    },
    computed: {
      userDescription () {
        const user = (this.selectedAvailableUsers[0] || {}).user || (this.selectedGroupUsers[0] || {}).user
        if (user) {
          return user.email
        }

        return 'Select a user to see their email.'
      }
    },
    methods: {
      getAvailableUsers () {
        this.loading = true
        const groupUserIds = this.newGroup.users.map((object) => { return object.user._id })
        const params = {}
        if (this.userSearchText) {
          params.$term = this.userSearchText
          params.$searchFields = ['firstName', 'lastName', 'email']
        }
        if (!_.isEmpty(groupUserIds)) {
          // EXPL: Exclude the current group users from the list of available users
          params.$exclude = groupUserIds
        }
        return this.$userRepository.list(params)
          .then((response) => {
            this.loading = false
            this.availableUsers = response.data.docs.map((user) => {
              return { user }
            })
            this.sortLists()
          })
          .catch((error) => {
            console.error('GroupUsers.getAvailableUsers-error:\n', error)
            this.$snotify.error('There was an error loading the users', 'Error!')
          })
      },
      addUsers () {
        this.dirty = true
        this.newGroup.users = this.newGroup.users.concat(this.selectedAvailableUsers)

        this.availableUsers = this.availableUsers.filter((object) => {
          return !this.selectedAvailableUsers.find((selectedObject) => {
            return selectedObject.user._id === object.user._id
          })
        })

        this.sortLists()
        eventBus.$emit(EVENTS.GROUP_USERS_UPDATED, this.newGroup.users)
      },
      removeUsers () {
        this.dirty = true
        this.availableUsers = this.availableUsers.concat(this.selectedGroupUsers)

        this.newGroup.users = this.newGroup.users.filter((object) => {
          return !this.selectedGroupUsers.find((selectedObject) => {
            return selectedObject.user._id === object.user._id
          })
        })

        this.sortLists()
        eventBus.$emit(EVENTS.GROUP_USERS_UPDATED, this.newGroup.users)
      },
      sortLists () {
        this.newGroup.users.sort((a, b) => { return a.user.lastName.localeCompare(b.user.lastName) })

        this.availableUsers.sort((a, b) => { return a.user.lastName.localeCompare(b.user.lastName) })
      },
      updateGroupUsers () {
        groupService.updateGroupUsers(this.newGroup._id, this.newGroup.users, this.oldGroup.users)
          .then((response) => {
            this.loading = false
            this.dirty = false
            this.oldGroup = _.cloneDeep(this.newGroup)
            eventBus.$emit(EVENTS.GROUP_USERS_SAVED)
            this.$snotify.success('Group users updated', 'Success!')
          })
          .catch((error) => {
            this.loading = false
            console.error('GroupUsers.updateGroupUsers-error:', error)
            this.$snotify.error('Update group users failed', 'Error!')
          })
      }
    },
    created () {
      this.newGroup.users = this.newGroup.users || []
      this.oldGroup = _.cloneDeep(this.newGroup)
      this.getAvailableUsers()
    }
  }
</script>
