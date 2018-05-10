<template>
  <section>
    <div v-if="loading" class="content content-centered">
      <pulse-loader></pulse-loader>
    </div>

    <div v-show="!loading" v-if="ready" class="content">
      <div class="box box-primary box-solid">
        <div class="box-header">
          <h3 class="box-title">{{newRole.name}}</h3>
        </div>
        <div class="box-body">

          <div class="row">
            <div class="flash-message col-md-4 col-md-offset-4 text-center" v-if="flash">
              <div class="alert" :class="'alert-' + flashType">{{ flashMessage }}</div>
            </div>
          </div>

          <ul class="nav nav-tabs">
            <li class="active"><a data-toggle="tab" href="#details">Details</a></li>
            <li><a data-toggle="tab" href="#permissions">Permissions</a></li>
          </ul>

          <div class="tab-content content">
        <div id="details" class="tab-pane fade in active">

          <vue-form :state="formstate" @submit.prevent="onSubmit" class="row">

            <div class="col-sm-4 col-sm-offset-4">

              <validate auto-label class="form-group" :class="fieldClassName(formstate.name)">
                <vue-form-input
                  required
                  v-model="newRole.name"
                  :formstate="formstate"
                  :type="'text'"
                  :label="'Name:'"
                  :name="'name'"
                  :messages="{ required: 'This field is required' }">
                </vue-form-input>
              </validate>

              <validate auto-label class="form-group" :class="fieldClassName(formstate.description)">
                <vue-form-input
                  v-model="newRole.description"
                  :formstate="formstate"
                  :type="'text'"
                  :label="'Description:'"
                  :name="'desription'">
                </vue-form-input>
              </validate>

            </div>

            <!--This is a dummy field to facilitate updating the formstate programmatically-->
            <validate class="hide"><input type="text" v-model="roleUpdated" name="roleUpdated" /></validate>

          </vue-form>

          <div class="py-2 text-center row" style="margin-top: 10px">
            <button class="btn btn-primary" type="submit" @click="updateRole" :disabled="formstate.$pristine || formstate.$invalid"
                    v-permission.enable="['role', 'updateRole']">Update Role</button>
          </div>

          <div class="py-2 text-center row" style="margin-top: 10px">
            <button class="btn btn-danger" @click="deleteRoleModal"
                    v-permission.enable="['role', 'deleteRole']">Delete Role</button>
            <button class="btn btn-primary" type="submit" @click="clearChanges" :disabled="formstate.$pristine">Clear Changes</button>
          </div>


        </div>
        <div id="permissions" class="tab-pane fade">
          <role-permissions :role="newRole" v-if="!loading"></role-permissions>
        </div>
      </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
  import RolePermissions from './RolePermissions.vue'
  import { roleService, formService, eventBus } from '../../../services'
  import { EVENTS } from '../../../config'

  import _ from 'lodash'
  import swal from 'sweetalert2'

  export default {
    name: 'RoleDetails',
    components: {
      RolePermissions
    },
    data () {
      return {
        ready: false,
        loading: false,
        flash: false,
        flashType: null,
        flashMessage: '',
        roleUpdated: null,
        EVENTS: EVENTS,
        newRole: {},
        oldRole: {},
        roles: [],
        permissions: [],
        formstate: {}
      }
    },
    methods: {
      fieldClassName: formService.fieldClassName,
      getRole () {
        const params = {
          $embed: ['permissions']
        }

        return this.$roleRepository.find(this.$route.params._id, params)
          .then((response) => {
            this.newRole = response.data
            this.oldRole = _.cloneDeep(this.newRole)
            this.$store.dispatch('setBreadcrumbTitle', this.newRole.name)
          })
          .catch((error) => {
            console.error('RoleDetails.getRole-error:', error)
            this.$snotify.error('Get role failed', 'Error!')
          })
      },
      clearChanges () {
        this.newRole = _.cloneDeep(this.oldRole)
        this.formstate._reset()
      },
      updateRole () {
        this.loading = true
        return roleService.updateRole(this.newRole, this.oldRole)
          .then((response) => {
            this.loading = false
            this.flash = false
            this.formstate._reset()
            this.oldRole = _.cloneDeep(this.newRole)
            this.$snotify.success('Role updated', 'Success!')
          })
          .catch(error => {
            this.loading = false
            console.error('RoleDetails.updateRole-error:', error)
            this.$snotify.error('Update role failed', 'Error!')
            if (error.data.message.includes('must be one of')) {
              this.flash = true
              this.flashType = 'error'
              this.flashMessage = 'That role name is not allowed. You must first update the list of allowed role names' +
                ' in the appy client and server config.'
            }
          })
      },
      deleteRoleModal () {
        swal({
          title: 'Are you sure?',
          text: 'This will permanently delete this role!',
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
          if (result.value) {
            this.deleteRole()
          }
        })
      },
      deleteRole () {
        this.loading = true
        return this.$roleRepository.deleteOne(this.newRole._id)
          .then((response) => {
            this.loading = false
            return swal(
              'Deleted!',
              'Role has been deleted.',
              'success'
            )
          })
          .then((response) => {
            this.loading = false
            this.$router.push('/roles')
          })
          .catch((error) => {
            this.loading = false
            console.error('RoleDetails.deleteRole-error:', error)
            this.$snotify.error('Delete role failed', 'Error!')
          })
      },
      updatePermissions (newPermissions) {
        this.newRole.permissions = newPermissions
        this.formstate.roleUpdated._setDirty()
      }
    },
    created () {
      const promises = []
      this.loading = true
      promises.push(this.getRole())
      Promise.all(promises)
        .then(() => {
          this.loading = false
          this.ready = true
        })
        .catch(() => {
          this.loading = false
        })
      eventBus.$on(EVENTS.PERMISSIONS_UPDATED, this.updatePermissions)
    },
    beforeDestroy () {
      eventBus.$off(EVENTS.PERMISSIONS_UPDATED, this.updatePermissions)
    }
  }
</script>