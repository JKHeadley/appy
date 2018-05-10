<template>
  <section class="content">
    <div>
      <div class="box box-primary box-solid">
        <div class="box-header">
          <h3 class="box-title">My Images</h3>
        </div>
        <div class="box-body" ref="imageBox" v-if="ready">

          <div v-if="images[0]">
            <carousel-3d ref="carousel"
                         v-if="enableCarousel"
                         :controlsVisible="true"
                         :width="imageSize.width"
                         :height="imageSize.height"
                         :controlsPrevHtml="controlsPrevHtml"
                         :controlsNextHtml="controlsNextHtml">
              <slide v-for="(image, index) in images" :index="index" :key="image._id">
                <a href="#" @click="openModal(index)"><img :src="image.imageUrl"></a>
              </slide>
            </carousel-3d>
          </div>
          <div v-else class="content content-centered">
            <span> You don't have any images yet. Click the button below to add some!</span>
          </div>

        </div>

        <div class="box-footer">

          <div class="row">
            <div class="content-centered">
              <router-link :to="{ name: 'ImageCreate' }">
                <button class="btn btn-primary btn-lg"><i class="fa fa-file-picture-o"
                  v-permission.enable="['image', 'createImage']"></i> Add Image</button>
              </router-link>
              <button class="btn btn-danger btn-lg" @click="openEditModal" style="margin-left: 15px;"><i class="fa fa-trash"></i> Edit Images</button>
            </div>
          </div>
        </div>

        <div v-if="loading" class="overlay">
          <i class="fa"><pulse-loader></pulse-loader></i>
        </div>
      </div>
    </div>


    <modal v-if="ready && carousel && enableCarousel && images[0]" :adaptive="true"
           :width="imageSize.width * 3"
           :height="imageSize.height * 3"
           name="image-modal"
           style="z-index: 2000">
      <img :src="images[carousel.currentIndex].imageUrl"
           @click="closeModal"
           :width="imageSize.width * 3"
           :height="imageSize.height * 3">
    </modal>

    <modal v-if="ready && carousel" :scrollable="true" :adaptive="true"
           :width="imageSize.width * 2.5"
           height="auto"
           name="edit-images-modal"
           style="z-index: 2000">
      <div class="box box-solid box-clear">
        <grid-layout
          ref="gridLayout"
          :layout="images"
          :col-num="4"
          :row-height="60"
          :is-draggable="false"
          :is-resizable="false"
          :is-mirrored="false"
          :vertical-compact="true"
          :margin="[5, 5]"
          :use-css-transforms="true">
          <grid-item v-for="image in images" :key="image.i"
                     :x="image.x"
                     :y="image.y"
                     :w="image.w"
                     :h="image.h"
                     :i="image.i"
                     @moved="updateIndex">
            <div class="content-centered" style="height: 100%">
              <img class='no-select' draggable="false" :src="image.imageUrl" :width="image.w * 70 * 2" :height="image.h * 70 * 2 / 3">
            </div>

            <svg @click="removeImage(image)" class="icon icon-edit-remove" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                 v-permission.enable="['image', 'deleteImage']">
              <path d="M511.921231 0C229.179077 0 0 229.257846 0 512 0 794.702769 229.179077 1024 511.921231 1024
              794.781538 1024 1024 794.702769 1024 512 1024 229.257846 794.781538 0 511.921231 0ZM732.041846 650.633846 650.515692
              732.081231C650.515692 732.081231 521.491692 593.683692 511.881846 593.683692 502.429538 593.683692 373.366154 732.081231
              373.366154 732.081231L291.761231 650.633846C291.761231 650.633846 430.316308 523.500308 430.316308 512.196923 430.316308
              500.696615 291.761231 373.523692 291.761231 373.523692L373.366154 291.918769C373.366154 291.918769 503.453538 430.395077
              511.881846 430.395077 520.349538 430.395077 650.515692 291.918769 650.515692 291.918769L732.041846 373.523692C732.041846
              373.523692 593.447385 502.547692 593.447385 512.196923 593.447385 521.412923 732.041846 650.633846 732.041846 650.633846Z"
                    fill="red">
              </path></svg>
          </grid-item>
        </grid-layout>

        <div v-if="loading" class="overlay">
          <i class="fa"><pulse-loader></pulse-loader></i>
        </div>
      </div>
    </modal>

  </section>
</template>

<script>
  export default {
    name: 'Images',
    data () {
      return {
        loading: null,
        ready: false,
        enableCarousel: true,
        images: [],
        carousel: null,
        imageSize: null,
        slickOptions: null,
        slickNavOptions: null,
        controlsPrevHtml: '<span class="fa fa-angle-left"></span>',
        controlsNextHtml: '<span class="fa fa-angle-right"></span>'
      }
    },
    computed: {
    },
    methods: {
      getImages () {
        this.loading = true
        this.$userRepository.getImages(this.$store.state.auth.user._id, {})
          .then((result) => {
            this.ready = true
            this.loading = false
            this.images = result.data.docs.map((image, index) => {
              image.x = index % 4
              image.y = image.x % 4
              image.w = 1
              image.h = 2
              image.i = index.toString()
              return image
            })
            this.refreshImage()
          })
          .catch((error) => {
            this.loading = false
            console.error('Images.getImages-error:', error)
            this.$snotify.error('Loading images failed', 'Error!')
          })
      },
      openModal (index) {
        if (index === this.carousel.currentIndex) {
          this.$modal.show('image-modal')
        }
      },
      openEditModal (index) {
        this.gridLayout = this.$refs.gridLayout
        this.$modal.show('edit-images-modal')
      },
      closeModal () {
        this.$modal.hide('image-modal')
      },
      closeEditModal () {
        this.$modal.hide('edit-images-modal')
      },
      refreshImage () {
        if (this.$refs.imageBox) {
          this.imageSize = {
            width: this.$refs.imageBox.clientWidth * 0.5,
            height: this.$refs.imageBox.clientWidth * (2 / 3) * 0.5
          }
        }
      },
      removeImage (imageToRemove) {
        this.loading = true
        this.$imageRepository.deleteOne(imageToRemove._id)
          .then((result) => {
            this.images.splice(this.images.indexOf(imageToRemove), 1)
            // This is a hack to rerender the carousel component
            this.enableCarousel = false
            setTimeout(() => {
              this.loading = false
              this.enableCarousel = true
              this.$snotify.success('Image removed', 'Success!')
            }, 1)
          })
          .catch((error) => {
            this.loading = false
            console.error('Images.removeImage-error:', error)
            this.$snotify.error('Removing image failed', 'Error!')
          })
      },
      updateIndex (index, newX, newY) {
        // NOTE: Eventually this could be used to allow images to be re-arranged
      }
    },
    mounted () {
      this.$nextTick(() => {
        window.addEventListener('resize', this.refreshImage)
      })
      this.imageSize = {
        width: 300,
        height: 200
      }

      this.getImages()
    },
    updated () {
      if (!this.carousel) {
        this.carousel = this.$refs.carousel
      }
    }
  }
</script>

<style lang="scss">
  .icon-edit-remove {
    width: 20px;
    height: 20px;
    position: absolute;
    top: 5%;
    right: 5%;
    background: #fff;
    border-radius: 50%;
    border: 2px solid #fff;
  }
  .icon-edit-remove:hover {
    cursor: pointer;
  }
  .vue-grid-layout {
    background-color: lightgray;
  }
  /*.no-select {*/
    /*-webkit-user-select: none;*/
    /*-khtml-user-select: none;*/
    /*-moz-user-select: none;*/
    /*-o-user-select: none;*/
    /*user-select: none;*/
    /*cursor: move;*/
  /*}*/
</style>
