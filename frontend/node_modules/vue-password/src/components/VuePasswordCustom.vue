<template>
  <div class="VuePassword">
    <div class="VuePassword__Input">
      <input type="password"
             :class="classes"
             :value="value"
             ref="input"
             @blur="emitBlur"
             @focus="emitFocus"
             @input="updatePassword($event.target.value)"
             v-bind="$attrs"
      >

      <slot name="password-toggle" v-if="!disableToggle" :toggle="togglePassword" :type="type">
        <a class="VuePassword__Toggle" role="button" @click="togglePassword">
          <svg class="VuePassword__Toggle__Icon" viewBox="0 0 32 32" v-if="type === 'password'">
            <path d="M16 6c-6.979 0-13.028 4.064-16 10 2.972 5.936 9.021 10 16 10s13.027-4.064 16-10c-2.972-5.936-9.021-10-16-10zM23.889 11.303c1.88 1.199 3.473 2.805 4.67 4.697-1.197 1.891-2.79 3.498-4.67 4.697-2.362 1.507-5.090 2.303-7.889 2.303s-5.527-0.796-7.889-2.303c-1.88-1.199-3.473-2.805-4.67-4.697 1.197-1.891 2.79-3.498 4.67-4.697 0.122-0.078 0.246-0.154 0.371-0.228-0.311 0.854-0.482 1.776-0.482 2.737 0 4.418 3.582 8 8 8s8-3.582 8-8c0-0.962-0.17-1.883-0.482-2.737 0.124 0.074 0.248 0.15 0.371 0.228v0zM16 13c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3z"></path>
          </svg>
          <svg class="VuePassword__Toggle__Icon" viewBox="0 0 32 32" v-if="type === 'text'">
            <path d="M29.561 0.439c-0.586-0.586-1.535-0.586-2.121 0l-6.318 6.318c-1.623-0.492-3.342-0.757-5.122-0.757-6.979 0-13.028 4.064-16 10 1.285 2.566 3.145 4.782 5.407 6.472l-4.968 4.968c-0.586 0.586-0.586 1.535 0 2.121 0.293 0.293 0.677 0.439 1.061 0.439s0.768-0.146 1.061-0.439l27-27c0.586-0.586 0.586-1.536 0-2.121zM13 10c1.32 0 2.44 0.853 2.841 2.037l-3.804 3.804c-1.184-0.401-2.037-1.521-2.037-2.841 0-1.657 1.343-3 3-3zM3.441 16c1.197-1.891 2.79-3.498 4.67-4.697 0.122-0.078 0.246-0.154 0.371-0.228-0.311 0.854-0.482 1.776-0.482 2.737 0 1.715 0.54 3.304 1.459 4.607l-1.904 1.904c-1.639-1.151-3.038-2.621-4.114-4.323z"></path>
            <path d="M24 13.813c0-0.849-0.133-1.667-0.378-2.434l-10.056 10.056c0.768 0.245 1.586 0.378 2.435 0.378 4.418 0 8-3.582 8-8z"></path>
            <path d="M25.938 9.062l-2.168 2.168c0.040 0.025 0.079 0.049 0.118 0.074 1.88 1.199 3.473 2.805 4.67 4.697-1.197 1.891-2.79 3.498-4.67 4.697-2.362 1.507-5.090 2.303-7.889 2.303-1.208 0-2.403-0.149-3.561-0.439l-2.403 2.403c1.866 0.671 3.873 1.036 5.964 1.036 6.978 0 13.027-4.064 16-10-1.407-2.81-3.504-5.2-6.062-6.938z"></path>
          </svg>
        </a>
      </slot>
    </div>

    <slot name="strength-meter" v-if="!disableStrength" :score="this.score">
      <svg viewBox="0 0 123 2" class="VuePassword__Meter" preserveAspectRatio="none">
        <path d="M0 1 L30 1" :class="getStrengthClass(0)"></path>
        <path d="M31 1 L61 1" :class="getStrengthClass(1)"></path>
        <path d="M62 1 L92 1" :class="getStrengthClass(2)"></path>
        <path d="M93 1 L123 1" :class="getStrengthClass(3)"></path>
      </svg>
    </slot>

    <slot name="strength-message" v-if="!disableStrength" :score="this.score">
      <div class="VuePassword__Message" :class="strengthClass">{{ message }}</div>
    </slot>
  </div>
</template>

<style>
  .VuePassword {
    position: relative;
  }

  .VuePassword__Input {
    position: relative;
  }

  .VuePassword input {
    padding-right: 2.5em;
    width: 100%;
  }

  .VuePassword__Toggle {
    color: gray;
    display: inline-block;
    height: 100%;
    position: absolute;
    right: 0;
    top: 0;
    z-index: 1;
  }

  .VuePassword__Toggle__Icon {
    fill: currentColor;
    height: 100%;
    width: 1.5em;
    margin-right: .5em;
    -webkit-user-select: none;
       -moz-user-select: none;
        -ms-user-select: none;
            user-select: none;
  }

  .VuePassword__Meter {
    color: rgb(175, 175, 175);
    display: block;
    height: .5rem;
    margin-top: .2rem;
    padding-left: .5rem;
    padding-right: .5rem;
    width: 100%;
  }

  .VuePassword__Meter path {
    stroke: currentColor;
    stroke-width: 2;
  }

  .VuePassword--very-weak {
    color: rgb(175, 175, 175);
  }

  .VuePassword--weak {
    color: rgb(230, 30, 30);
  }

  .VuePassword--medium {
    color: rgb(255, 160, 65);
  }

  .VuePassword--good {
    color: rgb(100, 200, 75);
  }

  .VuePassword--great {
    color: rgb(75, 150, 50);
  }

  .VuePassword__Message {
    cursor: default;
    font-size: 1rem;
    padding-left: .5rem;
    padding-right: .5rem;
    text-align: right;
    text-transform: uppercase;
  }
</style>

<script>
  export default{
    inheritAttrs: false,

    data () {
      return {
        type: 'password',
        strength: {},
        dirty: false
      }
    },

    computed: {
      /**
       * Get the current password strength message.
       *
       * @return {string}
       */
      message () {
        if (this.score >= 0 && this.dirty) {
          if (this.strengthMessages[this.score]) {
            return this.strengthMessages[this.score]
          }
        }
      },

      /**
       * Get the current password strength class.
       *
       * @return {string}
       */
      strengthClass () {
        if (this.score >= 0) {
          if (this.strengthClasses[this.score]) {
            return this.strengthClasses[this.score]
          }
        }
      }
    },

    props: {
      /**
       * Classes to apply to the password input.
       */
      classes: {
        type: [String, Array],
        default: 'form-control'
      },

      /**
       * Classes to apply for the various strength levels from zxcvbn.
       */
      strengthClasses: {
        type: Array,
        default () {
          return [
            'VuePassword--very-weak',
            'VuePassword--weak',
            'VuePassword--medium',
            'VuePassword--good',
            'VuePassword--great'
          ]
        }
      },

       /**
      * Messages to apply to the various strength levels from zxcvbn.
      */
      strengthMessages: {
        type: Array,
        default () {
          return [
            'Very Weak',
            'Weak',
            'Medium',
            'Strong',
            'Very Strong'
          ]
        }
      },

      value: {
        type: String,
        default: ''
      },
      /**
       * Set any additional user inputs to influence the password strength
       * calculated by zxcvbn.
       */
      userInputs: {
        type: Array,
        default () {
          return []
        }
      },

      /**
       * Disable the password toggle.
       */
      disableToggle: {
        type: Boolean,
        default: false
      },

      /**
       * Disable the password strength.
       */
      disableStrength: {
        type: Boolean,
        default: false
      },

      /**
       * Set the score for the strength meter.
       */
      score: {
        type: Number,
        default: 0
      }
    },

    mounted () {
      // If a password exists on mount, get the strength from zxcvbn.
      if (this.value) {
        this.dirty = true
      }
    },

    watch: {
      /**
       * Watch for changes in the user inputs prop to update the strength score.
       */
      userInputs () {
        this.$emit('input', this.value, this.userInputs)
      }
    },

    methods: {
      /**
       * Update the password input.
       *
       * @param  {String} password
       */
      updatePassword (password) {
        this.$emit('input', password, this.userInputs)
        this.dirty = true
      },

      /**
       * Toggle the visibilty of the password.
       */
      togglePassword () {
        this.type = this.type === 'password' ? 'text' : 'password'
        this.$refs.input.setAttribute('type', this.type)
        this.$refs.input.focus()
      },

      /**
       * Get the current strength class based on the current strength score.
       *
       * @param  {Number} strength
       * @return {String}
       */
      getStrengthClass (strength) {
        if (this.score > strength) {
          return this.strengthClass
        }

        return ''
      },

      emitBlur (event) {
        this.$emit('focus', event.target.value)
      },

      emitFocus (event) {
        this.$emit('focus', event.target.value)
      }
    }
  }
</script>
