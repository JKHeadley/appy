<template>
  <section>
    <div v-if="loading" class="content content-centered">
      <pulse-loader></pulse-loader>
    </div>

    <div v-show="!loading" class="content">
      <div class="box box-primary" ref="imageBox">
        <div class="box-header with-border">
          <h3 class="box-title">Create New Image</h3>
        </div>

        <div class="box-body">

          <div class="row content-centered">
            <croppa v-model="image"
                    :width="imageSize.width"
                    :height="imageSize.height"
                    placeholder="Click here to choose an image."
                    :placeholder-font-size="14"
                    accept=".png,.jpg,.gif"
                    :prevent-white-space="true"
                    @init="initImage"
                    @image-remove="onImageRemove"
                    @file-type-mismatch="onFileTypeMismatch"
                    @file-size-exceed="onFileSizeExceed"
                    @file-choose="onFileChoose"
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

          <div v-if="imageloading && percentCompleted >= 100" class="box box-solid">
            <div class="box-header content-centered">
              <h3>Finalizing...</h3>
            </div>

            <div class="box-body content-centered">
              <pulse-loader></pulse-loader>
            </div>
          </div>

        </div>

        <div class="box-footer" v-if="ready">
          <div class="row">
            <div class="content-centered">
              <button :disabled="(!image.hasImage() || !this.dirty) && !fileChosen"
                      class="btn btn-primary" @click="uploadImage"><i class="fa fa-file-picture-o"></i> Upload</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
  import { fileService } from '../../../services'
  import { EVENTS } from '../../../config'

  export default {
    name: 'ImageCreate',
    data () {
      return {
        ready: false,
        loading: false,
        EVENTS: EVENTS,
        image: {},
        imageSize: null,
        displayUrl: null,
        imageloading: false,
        fileChosen: false,
        dirty: false,
        fileUploading: false,
        percentCompleted: 0,
        imageName: '',
        imageType: '',
        imageUrl: null
      }
    },
    computed: {
    },
    methods: {
      onFileChoose (data) {
        this.dirty = true
        this.fileChosen = true
        this.imageName = data.name
        this.imageType = data.type
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
      uploadImage () {
        this.fileUploading = true
        this.imageloading = true
        this.image.generateBlob((blob) => {
          return fileService.uploadImage(this.imageName, blob, {
            onUploadProgress: (progressEvent) => {
              this.percentCompleted = Math.floor((progressEvent.loaded * 100) / progressEvent.total)
              console.log(this.percentCompleted)
              if (this.percentCompleted >= 100) {
                this.fileUploading = false
              }
            }
          })
            .then((response) => {
              this.imageUrl = response.data
              return this.$imageRepository.create({ imageUrl: this.imageUrl })
            })
            .then((response) => {
              this.imageloading = false
              this.fileChosen = false
              this.percentCompleted = 0
              this.$snotify.success('Image uploaded', 'Success!')
            })
            .catch((error) => {
              this.loading = false
              console.error('ImageCreate.uploadImage-error:', error)
              this.$snotify.error('Upload image failed', 'Error!')
            })
        }, this.imageType, 1)
      },
      refreshImage () {
        if (this.image) {
          this.image.refresh()
        }
      },
      initImage () {
        if (this.$refs.imageBox) {
          this.imageSize = {
            width: this.$refs.imageBox.clientWidth * 0.6,
            height: this.$refs.imageBox.clientWidth * (2 / 3) * 0.6
          }
        }
        this.image.remove()
        this.ready = true
      }
    },
    created () {
      this.$nextTick(() => {
        window.addEventListener('resize', this.refreshImage)
      })
      this.imageSize = {
        width: 300,
        height: 200
      }
    }
  }
</script>

<style lang="scss">
  .croppa-container {
    border: 2px solid grey;
    border-radius: 0%;
  }
  canvas {
    border: 2px solid grey;
    border-radius: 0%;
  }
</style>