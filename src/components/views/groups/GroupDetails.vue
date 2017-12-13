<template>
  <section>
    <div v-if="loading" class="content content-centered">
      <pulse-loader></pulse-loader>
    </div>

    <div v-show="!loading" v-if="ready" class="content">
      <h1 class="text-center">{{newGroup.name}}</h1>

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
                  v-model="newGroup.name"
                  :formstate="formstate"
                  :type="'text'"
                  :label="'Name:'"
                  :name="'name'"
                  :messages="{ required: 'This field is required' }">
                </vue-form-input>
              </validate>

              <validate auto-label class="form-group" :class="fieldClassName(formstate.description)">
                <vue-form-input
                  v-model="newGroup.description"
                  :formstate="formstate"
                  :type="'text'"
                  :label="'Description:'"
                  :name="'desription'">
                </vue-form-input>
              </validate>

            </div>

            <!--This is a dummy field to facilitate updating the formstate programmatically-->
            <validate class="hide"><input type="text" v-model="groupUpdated" name="groupUpdated" /></validate>

          </vue-form>

          <div class="py-2 text-center row" style="margin-top: 10px">
            <button class="btn btn-primary" type="submit" @click="updateGroup" :disabled="formstate.$pristine || formstate.$invalid">Update Group</button>
          </div>

          <div class="py-2 text-center row" style="margin-top: 10px">
            <button class="btn btn-danger" @click="deleteGroupModal">Delete Group</button>
            <button class="btn btn-primary" type="submit" @click="clearChanges" :disabled="formstate.$pristine">Clear Changes</button>
          </div>


        </div>
        <div id="permissions" class="tab-pane fade">
          <group-permissions :group="newGroup" v-if="!loading"></group-permissions>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
  import GroupPermissions from './GroupPermissions.vue'
  import { groupService, formService, eventBus } from '../../../services'
  import { EVENTS } from '../../../config'

  import _ from 'lodash'
  import swal from 'sweetalert2'

  export default {
    name: 'GroupDetails',
    components: {
      GroupPermissions
    },
    data () {
      return {
        ready: false,
        loading: false,
        flash: false,
        flashType: null,
        flashMessage: '',
        groupUpdated: null,
        EVENTS: EVENTS,
        newGroup: {},
        oldGroup: {},
        groups: [],
        permissions: [],
        formstate: {}
      }
    },
    methods: {
      fieldClassName: formService.fieldClassName,
      getGroup () {
        this.loading = true
        const params = {
          $embed: ['permissions']
        }
        const promises = []
        let promise = {}

        promise = this.$groupRepository.find(this.$route.params._id, params)
          .then((response) => {
            this.newGroup = response.data
            this.oldGroup = _.cloneDeep(this.newGroup)
            this.$store.dispatch('setBreadcrumbTitle', this.newGroup.name)
          })
        promises.push(promise)
        return Promise.all(promises)
          .then(() => {
            this.loading = false
          })
      },
      clearChanges () {
        this.newGroup = _.cloneDeep(this.oldGroup)
        this.formstate._reset()
      },
      updateGroup () {
        this.loading = true
        return groupService.updateGroup(this.newGroup, this.oldGroup)
          .then((response) => {
            this.loading = false
            this.flash = false
            this.formstate._reset()
            this.oldGroup = _.cloneDeep(this.newGroup)
            this.$snotify.success('Group updated', 'Success!')
          })
          .catch(error => {
            this.loading = false
            console.error('GroupDetails.updateGroup-error:', error)
            this.$snotify.error('Update group failed', 'Error!')
          })
      },
      deleteGroupModal () {
        swal({
          title: 'Are you sure?',
          text: 'This will permanently delete this group!',
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
          if (result.value) {
            this.deleteGroup()
          }
        })
      },
      deleteGroup () {
        this.loading = true
        return this.$groupRepository.deleteOne(this.newGroup._id)
          .then((response) => {
            this.loading = false
            return swal(
              'Deleted!',
              'Group has been deleted.',
              'success'
            )
          })
          .then((response) => {
            this.loading = false
            this.$router.push('/groups')
          })
          .catch((error) => {
            this.loading = false
            console.error('GroupDetails.deleteGroup-error:', error)
            this.$snotify.error('Delete group failed', 'Error!')
          })
      },
      updatePermissions (newPermissions) {
        this.newGroup.permissions = newPermissions
        this.formstate.groupUpdated._setDirty()
      }
    },
    created () {
      const promises = []
      promises.push(this.getGroup())
      Promise.all(promises)
        .then(() => {
          this.loading = false
          this.ready = true
        })
      eventBus.$on(EVENTS.PERMISSIONS_UPDATED, this.updatePermissions)
    },
    beforeDestroy () {
      eventBus.$off(EVENTS.PERMISSIONS_UPDATED, this.updatePermissions)
    }
  }
</script>
