<template>
  <section>
    <div v-if="loading" class="content content-centered">
      <pulse-loader></pulse-loader>
    </div>

    <div v-else class="content">
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
                <select name="role" class="form-control" v-model="user.role">
                  <option v-for="role in roles" :selected="user.role == role._id" :value="role._id">
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

          <div class="py-2 text-center row">
            <button class="btn btn-primary" type="submit" @click="updateUser" :disabled="formstate.$pristine || formstate.$invalid">Update</button>
            <button class="btn btn-primary" v-if="user.isActive" @click="deactivateUser">Deactivate</button>
            <button class="btn btn-primary" v-else @click="activateUser">Activate</button>
            <button class="btn btn-primary" v-if="user.isEnabled" @click="disableUser">Disable</button>
            <button class="btn btn-primary" v-else @click="enableUser">Enable</button>
            <button class="btn btn-primary" @click="deleteUser">Delete</button>
          </div>


        </div>
        <!--<div id="groups" class="tab-pane fade">-->
          <!--<h3 class="text-center">Add/Remove Groups</h3>-->

          <!--<div>-->
            <!--&lt;!&ndash;<input type="text" class="form-control input-lg" :change="getGroups()" placeholder="Search for groups to add" v-model="groupSearchText">&ndash;&gt;-->
          <!--</div>-->

          <!--<table>-->
            <!--<tr style="height:35px;margin-bottom:10px;">-->
            <!--<tr>-->
              <!--<td style="background-color:#202020">-->
                <!--<span style="margin-left:5px;color:white;background-color:#202020;width:250px;">Available</span>-->
              <!--</td>-->
              <!--<td>-->

              <!--</td>-->
              <!--<td style="background-color:#202020">-->
                <!--<span style="margin-left:5px;color:white;background-color:#202020;width:250px;">Current</span>-->
              <!--</td>-->
            <!--<tr>-->
            <!--<tr>-->
              <!--<td>-->
                <!--<div>-->
                  <!--<select multiple id="availablelist" size="10" style="width:275px" v-model="selectedAvailableGroups">-->
                    <!--<option v-for="obj in availableGroups" v-bind:value="obj">-->
                      <!--{{ obj.group.name }}-->
                    <!--</option>-->
                  <!--</select>-->
                <!--</div>-->
              <!--</td>-->
              <!--<td>-->
                <!--<div style="float:left; padding-left: 4px;">-->
                  <!--<button style="width:50px; text-align: center" :click="addGroups()">-->
                  <!--<i class="material-icons">arrow_forward</i>-->
                  <!--</button>-->
                  <!--<br/>-->
                  <!--<br/>-->
                  <!--<button style="width:50px; text-align: center" :click="removeGroups()">-->
                  <!--<i class="material-icons">arrow_back</i>-->
                  <!--</button>-->
                <!--</div>-->
              <!--</td>-->
              <!--<td>-->
                <!--<div>-->
                  <!--<select multiple id="userlist" size="10" style="width:275px" v-model="selectedUserGroups">-->
                    <!--<option v-for="obj in userGroups" v-bind:value="obj">-->
                      <!--{{ obj.group.name }}-->
                    <!--</option>-->
                  <!--</select>-->
                <!--</div>-->
              <!--</td>-->
            <!--<tr></tr>-->
          <!--</table>-->

        <!--</div>-->
        <div id="permissions" class="tab-pane fade">
          <h3>Menu 2</h3>
          <p>Some content in menu 2.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
  import userService from '../../../services/user.service'
  import formService from '../../../services/form.service'

  export default {
    name: 'UserDetails',
    data () {
      return {
        loading: null,
        error: null,
        user: null,
        roles: [],
        groupSearchText: null,
        availableGroups: [],
        selectedAvailableGroups: [],
        userGroups: [],
        selectedUserGroups: [],
        permissions: [],
        formstate: {}
      }
    },
    methods: {
      emailValidator: formService.emailValidator,
      fieldClassName: formService.fieldClassName,
      onSubmit: function () {
        console.log(this.formstate.$valid)
      },
      getUser () {
        this.user = this.error = null
        this.loading = true
        const params = {
          $embed: ['groups', 'permissions']
        }
        const promises = []
        let promise = {}

        promise = this.$userRepository.find(this.$route.params._id, params)
          .then((response) => {
            this.user = response.data
            this.userGroups = this.user.groups
            this.$store.dispatch('setBreadcrumbTitle', this.user.firstName + ' ' + this.user.lastName)
            console.log('USER')
            this.getGroups()
          })
        promises.push(promise)

        promise = this.getRoles()
        promises.push(promise)
        Promise.all(promises)
          .then(() => {
            this.loading = false
          })
      },
      getRoles () {
        return this.$roleRepository.list()
          .then((response) => {
            this.roles = response.data.docs
          })
      },
      getGroups () {
//        this.groupSearchText = this.groupSearchText === '' ? null : this.groupSearchText;
        const userGroupIds = this.userGroups.map((object) => { return object.group._id })
        const params = {}
        if (this.groupSearchText) {
          params.$term = this.groupSearchText
        }
        if (!_.isEmpty(userGroupIds)) {
          params.$exclude = userGroupIds
        }
        console.log('EXCLUDE:', params)
        return this.$groupRepository.list(params)
          .then((response) => {
            this.availableGroups = response.data.docs.map((group) => { return {group} })
//            this.availableGroups = response.data.docs
//            this.sortLists();
          })
          .catch((error) => {
            console.error('UserDetails.getGroups-error:\n', error)
            this.$snotify.error('There was an error loading the groups', 'Error!')
          })
      },
      addGroups () {
        this.userGroups = this.userGroups.concat(this.selectedAvailableGroups)

        this.availableGroups = this.availableGroups.filter((object) => {
          const found = this.selectedAvailableGroups.find((selectedObject) => {
            return selectedObject.group._id === object.group._id
          })
          return !found
        })

        console.log("ADD")

//        sortLists()
//        this.userDetailsForm.$dirty = true
      },
      removeGroups () {
        this.availableGroups = this.availableGroups.concat(this.selectedUserGroups)

        this.userGroups = this.userGroups.filter((object) => {
          const found = this.selectedUserGroups.find((selectedObject) => {
            return selectedObject.group._id === object.group._id
          })
          return !found
        })

        console.log("REMOVE")

//        this.sortLists()
//        this.userDetailsForm.$dirty = true
      },
      sortLists () {
        this.userPermissions.sort((a, b) => { return a.permission.name.localeCompare(b.permission.name) })

        this.availablePermissions.sort((a, b) => { return a.permission.name.localeCompare(b.permission.name) })
      },
      setRole (role) {
        this.user.role = role._id
      },
      updateUser () {
        this.loading = true
        userService.updateUser(this.user)
          .then((response) => {
            this.loading = false
            this.user = response.data
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
        this.$userRepository.deleteOne(this.user._id)
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
        userService.disableUser(this.user)
          .then((response) => {
            this.loading = false
            this.user = response.data
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
        userService.enableUser(this.user)
          .then((response) => {
            this.loading = false
            this.user = response.data
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
        userService.deactivateUser(this.user)
          .then((response) => {
            this.loading = false
            this.user = response.data
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
        userService.activateUser(this.user)
          .then((response) => {
            this.loading = false
            this.user = response.data
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
      this.getUser()
    }
  }
</script>
