<template>
  <section>
    <div class="box box-solid box-clear">
      <div class="content">
        <div class="row content-centered profile">
          <croppa v-model="profileImage"
                  :width="350"
                  :height="350"
                  placeholder="Click here to choose an image."
                  :placeholder-font-size="14"
                  accept=".png,.jpg,.jpeg,.gif"
                  @init="onReady"
                  @image-remove="onImageRemove"
                  @file-type-mismatch="onFileTypeMismatch"
                  @file-size-exceed="onFileSizeExceed"
                  @file-choose="onFileChoose"
                  :prevent-white-space="true"
                  :zoom-speed="5">

            <img crossorigin="anonymous" :src="displayUrl" slot="initial">
            <img slot="placeholder" src="/static/img/fa-expand.png">
          </croppa>
        </div>

        <div v-if="fileUploading" class="box box-solid">
          <div class="box-header content-centered">
            <h3>Uploading...</h3>
          </div>

          <div class="box-body">
            <div class="progress active">
              <div class="progress-bar progress-bar-success progress-bar-striped" role="progressbar"
                   :aria-valuenow="percentCompleted" aria-valuemin="0" aria-valuemax="100"
                   :style="'width: ' + percentCompleted + '%'">
                <span class="sr-only">{{percentCompleted}}% Complete</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="profileloading && percentCompleted >= 100" class="box box-solid">
          <div class="box-header content-centered">
            <h3>Finalizing...</h3>
          </div>

          <div class="box-body content-centered">
            <pulse-loader></pulse-loader>
          </div>
        </div>

        <div class="row" v-if="ready">
          <div class="content-centered">
            <button :disabled="(!profileImage.hasImage() || profileImageUrl.includes('gravatar') || !this.dirty) && !fileChosen"
                    @click="setProfileImage" class="btn btn-primary btn-lg" style="margin-top: 15px;">Set Profile Image</button>
            <button :disabled="profileImageUrl.includes('gravatar') || profileLoading"
                    @click="removeProfileImage" class="btn btn-danger btn-lg" style="margin-left: 10px; margin-top: 15px;">Remove Profile Image</button>
          </div>
        </div>
      </div>

      <div v-if="loading" class="overlay">
        <i class="fa">
          <pulse-loader></pulse-loader>
        </i>
      </div>
    </div>
  </section>
</template>

<script>
  import { userService, fileService } from '../../../services'

  export default {
    name: 'ProfileImage',
    data () {
      return {
        ready: false,
        loading: false,
        profileloading: false,
        fileChosen: false,
        dirty: false,
        fileUploading: false,
        percentCompleted: 0,
        profileImage: null,
        profileImageName: '',
        profileImageType: '',
        profileImageUrl: null
      }
    },
    computed: {
      displayUrl () {
        if (this.profileImageUrl.includes('gravatar')) {
          return this.profileImageUrl + '&s=256'
        } else {
          return this.profileImageUrl
        }
      }
    },
    methods: {
      onReady () {
        this.loading = false
        this.ready = true
      },
      onFileChoose (data) {
        this.dirty = true
        this.fileChosen = true
        this.profileImageName = data.name
        this.profileImageType = data.type
      },
      onImageRemove () {
        this.fileChosen = false
      },
      onFileTypeMismatch () {
        this.$snotify.warning('File type must be png, jpg, or gif', 'Warning!')
      },
      onFileSizeExceed () {
        this.$snotify.warning('Image size must be less than 100kb', 'Warning!')
      },
      setProfileImage () {
        this.fileUploading = true
        this.profileloading = true
        this.profileImage.generateBlob((blob) => {
          return fileService.uploadProfileImage(this.profileImageName, blob, {
            onUploadProgress: (progressEvent) => {
              this.percentCompleted = Math.floor((progressEvent.loaded * 100) / progressEvent.total)
              console.log(this.percentCompleted)
              if (this.percentCompleted >= 100) {
                this.fileUploading = false
              }
            }
          })
            .then((response) => {
              this.profileImageUrl = response.data
              return userService.updateUserProfile({ profileImageUrl: this.profileImageUrl })
            })
            .then((response) => {
              this.profileloading = false
              this.fileChosen = false
              this.percentCompleted = 0
              // Update the global user object
              const user = this.$store.state.auth.user
              user.profileImageUrl = this.profileImageUrl
              this.$store.commit('auth/SET_USER', user)
              this.$snotify.success('Profile image updated', 'Success!')
            })
            .catch((error) => {
              this.loading = false
              console.error('UserProfile.setProfileImage-error:', error)
              this.$snotify.error('Update image failed', 'Error!')
            })
        }, this.profileImageType, 1)
      },
      removeProfileImage () {
        this.loading = true
        this.profileImageUrl = 'https://www.gravatar.com/avatar/' + this.$store.state.auth.user._id + '?r=PG&d=robohash'
        return userService.updateUserProfile({ profileImageUrl: this.profileImageUrl })
          .then((response) => {
            this.loading = false
            // Update the global user object
            const user = this.$store.state.auth.user
            user.profileImageUrl = this.profileImageUrl
            this.$store.commit('auth/SET_USER', user)
            this.$snotify.success('Profile image removed', 'Success!')
          })
          .catch((error) => {
            this.loading = false
            console.error('UserProfile.removeProfileImage-error:', error)
            this.$snotify.error('Remove image failed', 'Error!')
          })
      }
    },
    created () {
      this.profileImageUrl = this.$store.state.auth.user.profileImageUrl
    }
  }
</script>

<style lang="scss">
  .profile {
    .croppa-container {
      border: 2px solid grey;
      border-radius: 50%;
    }
    canvas {
      border: 2px solid grey;
      border-radius: 50%;
    }
  }
</style>
