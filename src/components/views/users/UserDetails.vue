<template>
  <section>
    <div v-if="loading" class="content content-centered">
      <pulse-loader></pulse-loader>
    </div>

    <div v-else class="content">
      <h1 class="text-center">{{user.firstName}} {{user.lastName}}</h1>

      <ul class="nav nav-tabs">
        <li class="active"><a data-toggle="tab" href="#home">Details</a></li>
        <li><a data-toggle="tab" href="#menu1">Groups</a></li>
        <li><a data-toggle="tab" href="#menu2">Permissions</a></li>
      </ul>

      <div class="tab-content content">
        <div id="home" class="tab-pane fade in active">

          <vue-form :state="formstate" @submit.prevent="onSubmit" class="row">

            <div class="col-sm-6">

              <vue-form-input
                v-model="user.firstName"
                :formstate="formstate"
                :type="'text'"
                :label="'First Name:'"
                :name="'firstName'">
              </vue-form-input>

              <vue-form-input
                v-model="user.lastName"
                :formstate="formstate"
                :type="'text'"
                :label="'Last Name:'"
                :name="'lastName'">
              </vue-form-input>

              <vue-form-input
                v-model="user.email"
                :formstate="formstate"
                :type="'email'"
                :label="'Email:'"
                :name="'email'">
              </vue-form-input>

            </div>

            <div class="col-sm-6">

              <div class="form-group">
                <label>Role:</label>
                <vue-select label="name" :value="currentRole" :options="roles" :on-change="setRole"></vue-select>
              </div>

              <div class="form-group">
                <label>Active Status:</label>
                <input class="form-control" :disabled="true" :placeholder="user.isActive ? 'Activated' : 'Deactivated'"/>
              </div>

              <div class="form-group">
                <label>Enabled Status:</label>
                <input class="form-control" :disabled="true" :placeholder="user.isEnabled ? 'Enabled' : 'Disabled'"/>
              </div>

            </div>

          </vue-form>

          <div class="py-2 text-center row">
            <button class="btn btn-primary" @click="updateUser">Update</button>
            <button class="btn btn-primary" v-if="user.isActive" @click="deactivateUser">Deactivate</button>
            <button class="btn btn-primary" v-else @click="activateUser">Activate</button>
            <button class="btn btn-primary" v-if="user.isEnabled" @click="disableUser">Disable</button>
            <button class="btn btn-primary" v-else @click="enableUser">Enable</button>
            <button class="btn btn-primary" @click="deleteUser">Delete</button>
          </div>


        </div>
        <div id="menu1" class="tab-pane fade">
          <h3>Menu 1</h3>
          <p>Some content in menu 1.</p>
        </div>
        <div id="menu2" class="tab-pane fade">
          <h3>Menu 2</h3>
          <p>Some content in menu 2.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
  import userService from '../../../services/user.service'

  export default {
    name: 'UserDetails',
    data () {
      return {
        loading: null,
        error: null,
        user: null,
        roles: null,
        formstate: {}
      }
    },
    computed: {
      currentRole () {
        return this.roles.find(role => { return this.user.role === role._id })
      }
    },
    methods: {
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
            this.$store.dispatch('setBreadcrumbTitle', this.user.firstName + ' ' + this.user.lastName)
          })
        promises.push(promise)

        promise = this.$roleRepository.list()
          .then((response) => {
            this.roles = response.data.docs
          })
        promises.push(promise)
        Promise.all(promises)
          .then(() => {
            this.loading = false
          })
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
