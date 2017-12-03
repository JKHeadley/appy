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
                  v-model="selectedAvailableGroups" @change="selectedUserGroups = []">
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
          <select multiple ref="userlist" size="10" style="width: 100%;"
                  v-model="selectedUserGroups" @change="selectedAvailableGroups = []">
            <option v-for="obj in userGroups" v-bind:value="obj">
              {{ obj.group.name }}
            </option>
          </select>
        </div>

      </div>

      <div>
        <input class="form-control" style="margin-top: 15px" :disabled="true" :placeholder="groupDescription"/>
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
        <button class="btn btn-primary" ref="updateUserGroups" :disabled="true" @click="updateUserGroups">Update User</button>
      </div>
    </div>

  </section>
</template>

<script>
  import { userService, eventBus } from '../../../services'
  import { EVENTS } from '../../../config'

  export default {
    name: 'UserGroups',
    props: ['user', 'userScope'],
    data () {
      return {
        loading: null,
        groupSearchText: null,
        availableGroups: [],
        selectedAvailableGroups: [],
        userGroups: this.user.groups,
        selectedUserGroups: []
      }
    },
    computed: {
      groupDescription () {
        const group = (this.selectedAvailableGroups[0] || {}).group || (this.selectedUserGroups[0] || {}).group
        if (group) {
          return group.name + ': ' + group.description
        }

        return 'Select a group to see its description.'
      },
      computedUserScope () {
//        let permissions = this.userGroups.reduce((permissions, group) => {
//          return permissions.concat(group.group.permissions)
//        }, [])

        return userService.computeUserScope(this.user, this.user.role, this.userGroups, this.user.permissions)
      }
    },
    methods: {
      getAvailableGroups () {
        this.loading = true
        const userGroupIds = this.userGroups.map((object) => { return object.group._id })
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
            console.error('UserGroups.getAvailableGroups-error:\n', error)
            this.$snotify.error('There was an error loading the groups', 'Error!')
          })
      },
      addGroups () {
        this.$refs.updateUserGroups.disabled = false
        this.userGroups = this.userGroups.concat(this.selectedAvailableGroups)

        this.availableGroups = this.availableGroups.filter((object) => {
          return !this.selectedAvailableGroups.find((selectedObject) => {
            return selectedObject.group._id === object.group._id
          })
        })

        this.sortLists()
      },
      removeGroups () {
        this.$refs.updateUserGroups.disabled = false
        this.availableGroups = this.availableGroups.concat(this.selectedUserGroups)

        this.userGroups = this.userGroups.filter((object) => {
          return !this.selectedUserGroups.find((selectedObject) => {
            return selectedObject.group._id === object.group._id
          })
        })

        this.sortLists()
      },
      sortLists () {
        this.userGroups.sort((a, b) => { return a.group.name.localeCompare(b.group.name) })

        this.availableGroups.sort((a, b) => { return a.group.name.localeCompare(b.group.name) })
      },
      updateUserGroups () {
        this.loading = true
        userService.updateUserGroups(this.user, this.userGroups)
          .then((response) => {
            this.loading = false
            eventBus.$emit(EVENTS.USER_UPDATED)
            this.$refs.updateUserGroups.disabled = true
            this.user.groups = this.userGroups
            this.$snotify.success('User updated', 'Success!')
          })
          .catch((error) => {
            this.loading = false
            console.error('UserGroups.updateUserGroups-error:', error)
            this.$snotify.error('Update user failed', 'Error!')
          })
      }
    },
    created () {
      this.getAvailableGroups()
    }
  }
</script>
