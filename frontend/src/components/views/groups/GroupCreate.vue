<template>
  <section>
    <div v-if="loading" class="content content-centered">
      <pulse-loader></pulse-loader>
    </div>

    <div v-show="!loading" class="content">
    <div class="box box-primary box-solid">
      <div class="box-body">

        <div class="row">
          <div class="flash-message col-md-4 col-md-offset-4 text-center" v-if="flash">
            <div class="alert" :class="'alert-' + flashType">{{ flashMessage }}</div>
          </div>
        </div>

        <ul class="nav nav-tabs">
          <li class="active"><a data-toggle="tab" href="#details">Details</a></li>
          <li><a data-toggle="tab" href="#users">Users</a></li>
          <li><a data-toggle="tab" href="#permissions">Permissions</a></li>
        </ul>

        <div class="tab-content content">
          <div id="details" class="tab-pane fade in active">

            <vue-form :state="formstate" @submit.prevent="onSubmit" class="row">

              <div class="col-sm-4 col-sm-offset-4">

                <validate auto-label class="form-group" :class="fieldClassName(formstate.name)">
                  <vue-form-input
                    required
                    v-model="group.name"
                    :formstate="formstate"
                    :type="'text'"
                    :label="'Name:'"
                    :name="'name'"
                    :messages="{ required: 'This field is required' }">
                  </vue-form-input>
                </validate>

                <validate auto-label class="form-group" :class="fieldClassName(formstate.description)">
                  <vue-form-input
                    v-model="group.description"
                    :formstate="formstate"
                    :type="'text'"
                    :label="'Description:'"
                    :name="'description'">
                  </vue-form-input>
                </validate>

              </div>

            </vue-form>

            <div class="py-2 text-center row" style="margin-top: 10px">
              <button class="btn btn-primary" type="submit" @click="createGroup" :disabled="!(formstate.$dirty && formstate.$valid)">Create Group</button>
            </div>

          </div>
          <div id="users" class="tab-pane fade">
            <group-users :group="group" v-if="!loading"></group-users>
          </div>
          <div id="permissions" class="tab-pane fade">
            <group-permissions :group="group" v-if="!loading"></group-permissions>
          </div>
        </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
  import GroupUsers from './GroupUsers.vue'
  import GroupPermissions from './GroupPermissions.vue'
  import { groupService, formService, eventBus } from '../../../services'
  import { EVENTS } from '../../../config'

  export default {
    name: 'GroupCreate',
    components: {
      GroupUsers,
      GroupPermissions
    },
    data () {
      return {
        loading: false,
        flash: false,
        flashType: null,
        flashMessage: '',
        EVENTS: EVENTS,
        group: null,
        groups: [],
        permissions: [],
        formstate: {}
      }
    },
    methods: {
      fieldClassName: formService.fieldClassName,
      createGroup () {
        this.loading = true
        return groupService.createGroup(this.group)
          .then((response) => {
            this.loading = false
            this.flash = false
            this.$snotify.success('Group created', 'Success!')
            this.$router.push('/groups')
          })
          .catch(error => {
            this.loading = false
            console.error('GroupCreate.createGroup-error:', error)
            this.$snotify.error('Create group failed', 'Error!')
          })
      },
      updateUsers (users) {
        this.group.users = users
      },
      updatePermissions (permissions) {
        this.group.permissions = permissions
      }
    },
    created () {
      this.group = {
        users: [],
        permissions: []
      }
      eventBus.$on(EVENTS.GROUP_USERS_UPDATED, this.updateUsers)
      eventBus.$on(EVENTS.GROUP_PERMISSIONS_UPDATED, this.updatePermissions)
    },
    beforeDestroy () {
      eventBus.$off(EVENTS.GROUP_USERS_UPDATED, this.updateUsers)
      eventBus.$off(EVENTS.GROUP_PERMISSIONS_UPDATED, this.updatePermissions)
    }
  }
</script>