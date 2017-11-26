<template>
  <validate :state="formstate" auto-label class="form-group required-field" :class="fieldClassName(formstate.firstName)">
    <label>{{ label }}</label>
    <input :type="type" :name="name" class="form-control" v-bind:value="value" v-on:input="$emit('input', $event.target.value)">
    <field-messages :state="formstate" :name="name" show="$touched || $submitted">
      <div>
        <span class="glyphicon glyphicon-ok form-control-feedback"></span>
      </div>
      <div slot="required">
        <span class="glyphicon glyphicon-remove form-control-feedback"></span>
        <span class="has-error">First Name is a required field</span>
      </div>
    </field-messages>
  </validate>
</template>

<script>
  export default {
    props: ['value', 'formstate', 'type', 'name', 'label'],
    methods: {
      fieldClassName: function (field) {
        if (!field) {
          return ''
        }
        if ((field.$touched || field.$submitted) && field.$valid) {
          return ['has-success', 'has-feedback']
        }
        if ((field.$touched || field.$submitted) && field.$invalid) {
          return ['has-error', 'has-feedback']
        }
      },
    }
  }
</script>
