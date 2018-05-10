<template>
  <section>
    <div v-if="loading" class="content content-centered">
      <pulse-loader></pulse-loader>
    </div>

    <div v-show="!loading" v-if="ready" class="content">

      <div class="box box-primary box-solid">
        <div class="box-header">
          <h3 class="box-title">{{newPermission.name}}</h3>
        </div>
        <div class="box-body">
          <div class="row">
            <div class="flash-message col-md-4 col-md-offset-4 text-center" v-if="flash">
              <div class="alert" :class="'alert-' + flashType">{{ flashMessage }}</div>
            </div>
          </div>

          <ul class="nav nav-tabs">
            <li class="active"><a data-toggle="tab" href="#details">Details</a></li>
            <li><a data-toggle="tab" href="#users">Users</a></li>
            <li><a data-toggle="tab" href="#groups">Groups</a></li>
          </ul>

          <div class="tab-content content">
            <div id="details" class="tab-pane fade in active">

              <vue-form :state="formstate" @submit.prevent="onSubmit" class="row">

                <div class="col-sm-4 col-sm-offset-4">

                  <validate auto-label class="form-permission" :class="fieldClassName(formstate.name)">
                    <vue-form-input
                      required
                      v-model="newPermission.name"
                      :formstate="formstate"
                      :type="'text'"
                      :label="'Name:'"
                      :name="'name'"
                      :messages="{ required: 'This field is required' }">
                    </vue-form-input>
                  </validate>

                  <validate auto-label class="form-permission" :class="fieldClassName(formstate.description)">
                    <vue-form-input
                      v-model="newPermission.description"
                      :formstate="formstate"
                      :type="'text'"
                      :label="'Description:'"
                      :name="'desription'">
                    </vue-form-input>
                  </validate>

                </div>

                <!--This is a dummy field to facilitate updating the formstate programmatically-->
                <validate class="hide"><input type="text" v-model="permissionUsersUpdated" name="permissionUsersUpdated" /></validate>
                <validate class="hide"><input type="text" v-model="permissionGroupsUpdated" name="permissionGroupsUpdated" /></validate>

              </vue-form>

              <div class="py-2 text-center row" style="margin-top: 10px">
                <button class="btn btn-primary" type="submit" @click="updatePermission" :disabled="formstate.$pristine || formstate.$invalid">Update Permission</button>
              </div>

              <div class="py-2 text-center row" style="margin-top: 10px">
                <button class="btn btn-danger" @click="deletePermissionModal">Delete Permission</button>
                <button class="btn btn-primary" type="submit" @click="clearChanges" :disabled="formstate.$pristine">Clear Changes</button>
              </div>


            </div>
            <div id="users" class="tab-pane fade">
              <permission-users :permission="newPermission" v-if="!loading"></permission-users>
            </div>
            <div id="groups" class="tab-pane fade">
            <permission-groups :permission="newPermission" v-if="!loading"></permission-groups>
          </div>
          </div>

        </div>
      </div>
    </div>
  </section>
</template>

<script>
  import PermissionGroups from './PermissionGroups.vue'
  import PermissionUsers from './PermissionUsers.vue'
  import { permissionService, formService, eventBus } from '../../../services'
  import { EVENTS } from '../../../config'

  import _ from 'lodash'
  import swal from 'sweetalert2'

  export default {
    name: 'PermissionDetails',
    components: {
      PermissionUsers,
      PermissionGroups
    },
    data () {
      return {
        ready: false,
        loading: false,
        flash: false,
        flashType: null,
        flashMessage: '',
        permissionUsersUpdated: null,
        permissionGroupsUpdated: null,
        EVENTS: EVENTS,
        newPermission: {},
        oldPermission: {},
        permissions: [],
        groups: [],
        formstate: {}
      }
    },
    methods: {
      fieldClassName: formService.fieldClassName,
      getPermission () {
        this.loading = true
        const params = {
          $embed: ['groups', 'users']
        }

        return this.$permissionRepository.find(this.$route.params._id, params)
          .then((response) => {
            this.newPermission = response.data
            this.oldPermission = _.cloneDeep(this.newPermission)
            this.$store.dispatch('setBreadcrumbTitle', this.newPermission.name)
          })
          .catch((error) => {
            console.error('PermissionDetails.getPermission-error:', error)
            this.$snotify.error('Get permission failed', 'Error!')
          })
      },
      clearChanges () {
        this.newPermission = _.cloneDeep(this.oldPermission)
        this.formstate._reset()
      },
      updatePermission () {
        this.loading = true
        return permissionService.updatePermission(this.newPermission, this.oldPermission)
          .then((response) => {
            this.loading = false
            this.flash = false
            this.formstate._reset()
            this.oldPermission = _.cloneDeep(this.newPermission)
            this.$snotify.success('Permission updated', 'Success!')
          })
          .catch(error => {
            this.loading = false
            console.error('PermissionDetails.updatePermission-error:', error)
            this.$snotify.error('Update permission failed', 'Error!')
          })
      },
      deletePermissionModal () {
        swal({
          title: 'Are you sure?',
          text: 'This will permanently delete this permission!',
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
          if (result.value) {
            this.deletePermission()
          }
        })
      },
      deletePermission () {
        this.loading = true
        return this.$permissionRepository.deleteOne(this.newPermission._id)
          .then((response) => {
            this.loading = false
            return swal(
              'Deleted!',
              'Permission has been deleted.',
              'success'
            )
          })
          .then((response) => {
            this.loading = false
            this.$router.push('/permissions')
          })
          .catch((error) => {
            this.loading = false
            console.error('PermissionDetails.deletePermission-error:', error)
            this.$snotify.error('Delete permission failed', 'Error!')
          })
      },
      updateUsers (newUsers) {
        this.newPermission.users = newUsers
        this.formstate.permissionUsersUpdated._setDirty()
      },
      clearUsers () {
        this.formstate.permissionUsersUpdated._setPristine()
      },
      updateGroups (newGroups) {
        this.newPermission.groups = newGroups
        this.formstate.permissionGroupsUpdated._setDirty()
      },
      clearGroups () {
        this.formstate.permissionGroupsUpdated._setPristine()
      },
    },
    created () {
      const promises = []
      this.loading = true
      promises.push(this.getPermission())
      Promise.all(promises)
        .then(() => {
          this.loading = false
          this.ready = true
        })
        .catch(() => {
          this.loading = false
        })
      eventBus.$on(EVENTS.PERMISSION_USERS_UPDATED, this.updateUsers)
      eventBus.$on(EVENTS.PERMISSION_USERS_SAVED, this.clearUsers)
      eventBus.$on(EVENTS.PERMISSION_GROUPS_UPDATED, this.updateGroups)
      eventBus.$on(EVENTS.PERMISSION_GROUPS_SAVED, this.clearGroups)
    },
    beforeDestroy () {
      eventBus.$off(EVENTS.PERMISSION_USERS_UPDATED, this.updateUsers)
      eventBus.$off(EVENTS.PERMISSION_USERS_SAVED, this.clearUsers)
      eventBus.$off(EVENTS.PERMISSION_GROUPS_UPDATED, this.updateGroups)
      eventBus.$off(EVENTS.PERMISSION_GROUPS_SAVED, this.clearGroups)
    }
  }
</script>