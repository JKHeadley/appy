<template>
  <section>

    <div class="box box-primary box-solid box-modal">
      <div class="box-header">
        <h2 class="box-title">Sharing settings</h2>
        <div class="box-tools">
          <button class="btn btn-box-tool" @click="closeModal" title="Collapse"><i class="fa fa-times"></i></button>
        </div>
      </div>

      <div class="box-body">

        <box :classes="['box-danger']" :canCollapse="true" :canClose="true" :disableFooter="true">
          <div slot="header">
            <h3 class="box-title">Users with access</h3>
          </div>

          <div slot="body">
            <v-server-table ref="shareTable" url="" :columns="shareTableColumns" :options="shareTableOptions">
              <template slot="editAccess" slot-scope="props">
                <div>
                  <div class="btn-group">
                    <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
                      <a class="fa fa-pencil"></a><span class="caret" style="margin-left: 5px;"></span>
                    </button>

                    <ul class="dropdown-menu">
                      <li @click="allowEdit(props.row)"><a href="#"><i v-if="props.row.user_document.canEdit" class="fa fa-check" aria-hidden="true"></i> Can edit</a></li>
                      <li @click="allowView(props.row)"><a href="#"><i v-if="!props.row.user_document.canEdit" class="fa fa-check" aria-hidden="true"></i> Can view</a></li>
                    </ul>

                    <button @click="stopSharing(props.row)" type="button" class="btn btn-default"
                            v-permission.enable="['document', 'associateDocument', 'removeDocumentUsers']">
                      <a class="fa fa-times"></a>
                    </button>
                  </div>
                </div>
              </template>
              <template slot="avatar" slot-scope="props">
                <div>
                  <img :src="props.row.profileImageUrl" class="user-image" alt="User Image">
                </div>
              </template>
            </v-server-table>
          </div>

          <div v-if="shareLoading" class="overlay">
            <i class="fa"><pulse-loader></pulse-loader></i>
          </div>
        </box>

        <box :classes="['box-success']" :canCollapse="true" :canClose="true" :disableFooter="true">
          <div slot="header">
            <h3 class="box-title">Invite users</h3>
          </div>

          <div slot="body">
            <v-server-table ref="inviteTable" url="" :columns="inviteTableColumns" :options="inviteTableOptions">
              <template slot="invite" slot-scope="props">
                <div class="checkbox checkbox-success" @click="removeDuplicate({ childId: props.row._id, canEdit: true })">
                  <input type="checkbox" :id="'invite_edit_' + props.row._id" :value="{ childId: props.row._id, canEdit: true }" v-model="usersToInvite">
                  <label :for="'invite_edit_' + props.row._id">Edit</label>
                </div>
                <div class="checkbox checkbox-warning" @click="removeDuplicate({ childId: props.row._id, canEdit: false })">
                  <input type="checkbox" :id="'invite_view_' + props.row._id" :value="{ childId: props.row._id, canEdit: false }" v-model="usersToInvite">
                  <label :for="'invite_view_' + props.row._id">View</label>
                </div>
              </template>
              <template slot="avatar" slot-scope="props">
                <div>
                  <img :src="props.row.profileImageUrl" class="user-image" alt="User Image">
                </div>
              </template>
            </v-server-table>
          </div>

          <div v-if="inviteLoading" class="overlay">
            <i class="fa"><pulse-loader></pulse-loader></i>
          </div>
        </box>
      </div>

      <div class="box-footer">
        <button type="button" class="btn btn-default pull-left" @click="closeModal">Close</button>
        <button type="button" class="btn btn-primary pull-right" @click="inviteUsers" :disabled="!usersToInvite[0]"
                v-permission.enable="['document', 'associateDocument', 'addDocumentUsers']">Invite Users</button>
      </div>

      <div v-if="loading" class="overlay">
        <i class="fa"><pulse-loader></pulse-loader></i>
      </div>
    </div>

  </section>
</template>

<script>
  import { documentService } from '../../../services'

  import faker from 'faker'

  export default {
    name: 'DocumentSharing',
    props: ['document'],
    data () {
      return {
        loading: false,
        shareLoading: false,
        inviteLoading: false,
        usersToInvite: [],
        sharedUsers: [],
        shareTableColumns: ['avatar', 'firstName', 'lastName', 'email', 'editAccess'],
        shareTableOptions: {
          highlightMatches: true,
          sortable: ['firstName', 'lastName', 'email'],
          requestFunction: (request) => {
            this.shareLoading = true
            const params = {}
            params.$page = request.page
            params.$limit = request.limit
            if (request.orderBy) {
              params.$sort = request.ascending ? '-' + request.orderBy : request.orderBy
            }
            if (request.query) {
              params.$term = request.query
            }
            return this.$documentRepository.getUsers(this.document._id, params)
          },
          responseAdapter: (response) => {
            this.sharedUsers = response.data.docs
            this.$refs.inviteTable.refresh()
            this.shareLoading = false
            return { data: response.data.docs, count: response.data.items.total }
          },
          uniqueKey: '_id'
        },
        inviteTableColumns: ['avatar', 'firstName', 'lastName', 'email', 'invite'],
        inviteTableOptions: {
          highlightMatches: true,
          sortable: ['firstName', 'lastName', 'email'],
          requestFunction: (request) => {
            this.inviteLoading = true
            const params = {}
            params.$page = request.page
            params.$limit = request.limit
            if (request.orderBy) {
              params.$sort = request.ascending ? '-' + request.orderBy : request.orderBy
            }
            if (request.query) {
              params.$term = request.query
            }
            if (this.sharedUserIds[0]) {
              params.$exclude = this.sharedUserIds
            }
            return this.$userRepository.list(params)
          },
          responseAdapter: (response) => {
            this.inviteLoading = false
            return response ? { data: response.data.docs, count: response.data.items.total } : { data: [], count: 0 }
          },
          uniqueKey: '_id'
        }
      }
    },
    computed: {
      sharedUserIds () {
        return this.sharedUsers.map((user) => { return user._id })
      }
    },
    methods: {
      avatar () { return faker.image.avatar() },
      inviteUsers () {
        this.loading = true
        documentService.updateDocumentUsers(this.document._id, this.usersToInvite)
          .then((response) => {
            this.loading = false
            this.usersToInvite = []
            this.$refs.shareTable.refresh()
            this.$snotify.success('Users invited', 'Success!')
          })
          .catch((error) => {
            this.loading = false
            console.error('DocumentSharing.inviteUsers-error:', error)
            this.$snotify.error('Invite users failed', 'Error!')
          })
      },
      allowEdit (user) {
        this.shareLoading = true
        this.$documentRepository.addOneUsers(this.document._id, user._id, { canEdit: true })
          .then((response) => {
            this.$refs.shareTable.refresh()
            this.$snotify.success('User access updated', 'Success!')
          })
          .catch((error) => {
            this.shareLoading = false
            console.error('DocumentSharing.allowEdit-error:', error)
            this.$snotify.error('Access update failed', 'Error!')
          })
      },
      allowView (user) {
        this.shareLoading = true
        this.$documentRepository.addOneUsers(this.document._id, user._id, { canEdit: false })
          .then((response) => {
            this.$refs.shareTable.refresh()
            this.$snotify.success('User access updated', 'Success!')
          })
          .catch((error) => {
            this.shareLoading = false
            console.error('DocumentSharing.allowEdit-error:', error)
            this.$snotify.error('Access update failed', 'Error!')
          })
      },
      stopSharing (user) {
        this.shareLoading = true
        this.$documentRepository.removeOneUsers(this.document._id, user._id)
          .then((response) => {
            this.$refs.shareTable.refresh()
            this.$snotify.success('User access updated', 'Success!')
          })
          .catch((error) => {
            this.shareLoading = false
            console.error('DocumentSharing.allowEdit-error:', error)
            this.$snotify.error('Access update failed', 'Error!')
          })
      },
      closeModal () {
        this.$emit('exit')
      },
      // This makes sure the "Edit" and "View" checkboxes aren't both checked at the same time
      removeDuplicate (item) {
        this.usersToInvite = this.usersToInvite.filter((currentItem) => {
          if (currentItem.childId === item.childId && currentItem.canEdit !== item.canEdit) {
            return false
          }
          return true
        })
      }
    },
    created () {
    },
    beforeDestroy () {
    }
  }
</script>

<style lang="scss">
  .box-modal {
    background-color: #f4f4f4;
    .dropdown-menu {
      right: 0;
    }
    .fa {
      color: #484848;
    }
  }
</style>
