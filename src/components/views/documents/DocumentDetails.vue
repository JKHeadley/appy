<template>
  <section>
    <div v-if="loading" class="content content-centered">
      <pulse-loader></pulse-loader>
    </div>

    <div v-show="!loading" class="content">

      <div class="col-md-9">
        <div class="box box-primary">
        <div class="box-header with-border">
          <h3 class="box-title">Edit Document</h3>
        </div>
        <!-- /.box-header -->
        <div class="box-body">
          <div class="form-document">
            <input class="form-control" placeholder="Title" v-model="newDocument.title">
          </div>

          <vue-editor :body="newDocument.body"></vue-editor>

        </div>
        <!-- /.box-body -->
        <div class="box-footer">
          <div class="pull-right">
            <button class="btn btn-danger" @click="deleteDocumentModal"><i class="fa fa-trash"></i> Delete</button>
            <button class="btn btn-primary" @click="requestDataToSave"><i class="fa fa-file-text"></i> Save Changes</button>
          </div>
          <button class="btn btn-default" @click="clearDocument"><i class="fa fa-times"></i> Clear</button>
          <button class="btn btn-default" @click="resetDocument"><i class="fa fa-refresh"></i> Reset</button>
        </div>
        <!-- /.box-footer -->
      </div>
      </div>

      <div class="col-md-3">
        <div class="box box-danger">
          <div class="box-header with-border">
            <h3 class="box-title">Shared With</h3>

            <div class="box-tools pull-right">
              <button type="button" class="btn btn-box-tool" data-widget="collapse"><i class="fa fa-minus"></i>
              </button>
              <button type="button" class="btn btn-box-tool" data-widget="remove"><i class="fa fa-times"></i>
              </button>
            </div>
          </div>
          <!-- /.box-header -->
          <div class="box-body no-padding">
            <ul class="users-list clearfix">
              <li>
                <img :src="avatar()" alt="User Image">
                <a class="users-list-name" href="#">Alexander Pierce</a>
                <span class="users-list-date">Today</span>
              </li>
              <li>
                <img :src="avatar()" alt="User Image">
                <a class="users-list-name" href="#">Norman</a>
                <span class="users-list-date">Yesterday</span>
              </li>
              <li>
                <img :src="avatar()" alt="User Image">
                <a class="users-list-name" href="#">Jane</a>
                <span class="users-list-date">12 Jan</span>
              </li>
              <li>
                <img :src="avatar()" alt="User Image">
                <a class="users-list-name" href="#">John</a>
                <span class="users-list-date">12 Jan</span>
              </li>
              <li>
                <img :src="avatar()" alt="User Image">
                <a class="users-list-name" href="#">Alexander</a>
                <span class="users-list-date">13 Jan</span>
              </li>
              <li>
                <img :src="avatar()" alt="User Image">
                <a class="users-list-name" href="#">Sarah</a>
                <span class="users-list-date">14 Jan</span>
              </li>
              <li>
                <img :src="avatar()" alt="User Image">
                <a class="users-list-name" href="#">Nora</a>
                <span class="users-list-date">15 Jan</span>
              </li>
              <li>
                <img :src="avatar()" alt="User Image">
                <a class="users-list-name" href="#">Nadia</a>
                <span class="users-list-date">15 Jan</span>
              </li>
            </ul>
            <!-- /.users-list -->
          </div>
          <!-- /.box-body -->
          <div class="box-footer text-center">
            <!--<a href="#" class="uppercase" data-toggle="modal" data-target="#document-sharing-modal">Manage Sharing</a>-->
            <a href="#" class="uppercase" @click="openSharingModal">Manage Sharing</a>
          </div>
          <!-- /.box-footer -->
        </div>
      </div>

      <modal :scrollable="true" :clickToClose="false" height="auto" name="document-sharing-modal" style="z-index: 2000">
        <document-sharing :document="newDocument" @exit="closeModal"></document-sharing>
      </modal>

      <!--<div class="modal fade" id="document-sharing-modal" ref="document-sharing-modal">-->
        <!--<document-sharing :document="newDocument" :userIds="userIds" @exit="closeModal"></document-sharing>-->
      <!--</div>-->
    </div>
  </section>
</template>

<script>
  import { eventBus, documentService } from '../../../services'
  import { EVENTS } from '../../../config'

  import DocumentSharing from './DocumentSharing.vue'

  import $ from 'jquery'
  import swal from 'sweetalert2'
  import faker from 'faker'

  export default {
    name: 'DocumentDetails',
    components: {
      DocumentSharing
    },
    data () {
      return {
        loading: false,
        EVENTS: EVENTS,
        newDocument: {},
        oldDocument: {},
      }
    },
    methods: {
      avatar () { return faker.image.avatar() },
      getDocument () {
//        const params = {
//          $embed: ['users']
//        }

        return this.$documentRepository.find(this.$route.params._id, {})
          .then((response) => {
            this.newDocument = response.data
            this.oldDocument = _.cloneDeep(this.newDocument)
//            this.userIds = response.data.users.map((user) => { return user._id })
            this.$store.dispatch('setBreadcrumbTitle', this.newDocument.title)
          })
          .catch((error) => {
            console.error('DocumentDetails.getDocument-error:', error)
            this.$snotify.error('Get document failed', 'Error!')
          })
      },
      clearDocument () {
        this.newDocument.body = ''
        this.newDocument.title = ''
      },
      resetDocument () {
        this.clearDocument()
        // EXPL: This is a hack to refresh the body property
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
      }
    },
    created () {
      const promises = []
      this.loading = true
      promises.push(this.getDocument())
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
