<template>
  <section>
    <div v-if="loading" class="content content-centered">
      <pulse-loader></pulse-loader>
    </div>

    <div v-show="!loading" class="content">

      <div class="col-md-8">
        <div class="box box-primary">
          <div class="box-header with-border">
            <h3 v-if="canEdit" class="box-title">Edit Document</h3>
            <h3 v-else class="box-title">View Document</h3>
          </div>
          <!-- /.box-header -->
          <div class="box-body">
            <div class="form-document">
              <input :disabled="!canEdit" class="form-control" placeholder="Title" v-model="newDocument.title">
            </div>

            <vue-editor :body="newDocument.body" :canEdit="canEdit"></vue-editor>

          </div>
          <!-- /.box-body -->
          <div class="box-footer" v-if="canEdit">
            <div class="pull-right">
              <button class="btn btn-danger" @click="deleteDocumentModal"
                      v-permission.enable="['document', 'deleteDocument']"><i class="fa fa-trash"></i> Delete</button>
              <button class="btn btn-primary" @click="requestDataToSave"
                      v-permission.enable="['document', 'updateDocument']"><i class="fa fa-file-text"></i> Save Changes</button>
            </div>
            <button class="btn btn-default" @click="clearDocument"><i class="fa fa-times"></i> Clear</button>
            <button class="btn btn-default" @click="resetDocument"><i class="fa fa-refresh"></i> Reset</button>
          </div>
          <!-- /.box-footer -->
        </div>
      </div>

      <div class="col-md-4">

        <box :classes="['box-danger']"
             :canCollapse="true"
             :canClose="true"
             :disableFooter="true"
             :noPadding="true"
             :headerBorder="true">
          <div slot="header">
            <h3 class="box-title">Owner</h3>
          </div>

          <div slot="body">
            <ul class="users-list clearfix">
              <li>
                <img :src="newDocument.owner.profileImageUrl" alt="User Image">

                <router-link :to="'/members/' + newDocument.owner._id">
                  <a class="users-list-name" href="#">{{ getName(newDocument.owner) }}</a>
                </router-link>

                <!--<span class="users-list-date">Today</span>-->
              </li>
            </ul>
          </div>

          <div v-if="sharedUsersLoading" class="overlay">
            <i class="fa"><pulse-loader></pulse-loader></i>
          </div>
        </box>

        <box :classes="['box-danger']"
             :canCollapse="true"
             :canClose="true"
             :noPadding="true"
             :headerBorder="true">
          <div slot="header">
            <h3 class="box-title">Shared With</h3>
          </div>

          <div slot="body">
            <ul class="users-list clearfix">
              <li v-for="user in sharedUsers">
                <img :src="user.profileImageUrl" alt="User Image">

                <router-link :to="'/members/' + user._id">
                  <a class="users-list-name" href="#">{{ getName(user) }}</a>
                </router-link>

                <!--<span class="users-list-date">Today</span>-->
              </li>
            </ul>
          </div>

          <div v-if="isOwner" slot="footer">
            <div class="text-center">
              <a href="#" class="uppercase" @click="openSharingModal">Manage Sharing</a>
            </div>
          </div>

          <div v-if="sharedUsersLoading" class="overlay">
            <i class="fa"><pulse-loader></pulse-loader></i>
          </div>
        </box>
      </div>

      <modal :scrollable="true" :clickToClose="false" height="auto" name="document-sharing-modal" style="z-index: 2000">
        <document-sharing :document="newDocument" @exit="closeModal"></document-sharing>
      </modal>

    </div>
  </section>
</template>

<script>
  import { eventBus, documentService } from '../../../services'
  import { EVENTS } from '../../../config'

  import DocumentSharing from './DocumentSharing.vue'

  import swal from 'sweetalert2'
  import faker from 'faker'
  import _ from 'lodash'

  export default {
    name: 'DocumentDetails',
    components: {
      DocumentSharing
    },
    props: ['canEdit'],
    data () {
      return {
        loading: false,
        sharedUsersLoading: false,
        EVENTS: EVENTS,
        sharedUsers: [],
        newDocument: {},
        oldDocument: {},
      }
    },
    computed: {
      isOwner () {
        return this.$store.state.auth.user._id === this.newDocument.owner._id
      }
    },
    methods: {
      avatar () { return faker.image.avatar() },
      getName (user) {
        if (user._id === this.$store.state.auth.user._id) {
          return 'You'
        } else {
          return user.firstName
        }
      },
      getDocument () {
        return this.$documentRepository.find(this.$route.params._id, { $embed: ['owner'] })
          .then((response) => {
            this.newDocument = response.data
            this.oldDocument = _.cloneDeep(this.newDocument)
            this.$store.dispatch('setBreadcrumbTitle', this.newDocument.title)
          })
          .catch((error) => {
            console.error('DocumentDetails.getDocument-error:', error)
            this.$snotify.error('Get document failed', 'Error!')
          })
      },
      getUsers () {
        this.sharedUsersLoading = true
        return this.$documentRepository.getUsers(this.$route.params._id, { $select: ['firstName', 'profileImageUrl'] })
          .then((response) => {
            this.sharedUsersLoading = false
            this.sharedUsers = response.data.docs
          })
          .catch((error) => {
            console.error('DocumentDetails.getUsers-error:', error)
            this.$snotify.error('Get shared users failed', 'Error!')
          })
      },
      clearDocument () {
        this.newDocument.body = ''
        this.newDocument.title = ''
      },
      resetDocument () {
        this.clearDocument()
        // This is a hack to refresh the body property
        setTimeout(() => {
          this.newDocument = _.cloneDeep(this.oldDocument)
        }, 1)
      },
      requestDataToSave () {
        eventBus.$emit(EVENTS.DATA_REQUESTED)
      },
      updateDocument (data) {
        this.loading = true
        this.newDocument.body = data
        return documentService.updateDocument(this.newDocument)
          .then((response) => {
            this.loading = false
            this.oldDocument = _.cloneDeep(this.newDocument)
            this.$snotify.success('Document updated', 'Success!')
          })
          .catch(error => {
            this.loading = false
            console.error('DocumentDetails.updateDocument-error:', error)
            this.$snotify.error('Update document failed', 'Error!')
          })
      },
      deleteDocumentModal () {
        swal({
          title: 'Are you sure?',
          text: 'This will permanently delete this document!',
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
          if (result.value) {
            this.deleteDocument()
          }
        })
      },
      deleteDocument () {
        this.loading = true
        return this.$documentRepository.deleteOne(this.newDocument._id)
          .then((response) => {
            this.loading = false
            return swal(
              'Deleted!',
              'Document has been deleted.',
              'success'
            )
          })
          .then((response) => {
            this.loading = false
            this.$router.push('/documents')
          })
          .catch((error) => {
            this.loading = false
            console.error('DocumentDetails.deleteDocument-error:', error)
            this.$snotify.error('Delete document failed', 'Error!')
          })
      },
      openSharingModal () {
        this.$modal.show('document-sharing-modal')
      },
      closeModal () {
        this.$modal.hide('document-sharing-modal')
        this.getUsers()
      }
    },
    created () {
      const promises = []
      this.loading = true
      promises.push(this.getDocument())
      promises.push(this.getUsers())
      Promise.all(promises)
        .then(() => {
          this.loading = false
          this.ready = true
        })
        .catch(() => {
          this.loading = false
        })
      eventBus.$on(EVENTS.DATA_READY, this.updateDocument)
    },
    beforeDestroy () {
      eventBus.$off(EVENTS.DATA_READY, this.updateDocument)
    }
  }
</script>

<style lang="scss">
  .box-modal {
    margin-bottom: 0px;
  }
  .v--modal-box {
    margin-top: 15px;
  }
</style>
