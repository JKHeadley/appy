<template>
  <div :class="label ? 'vf-labeled' : ''">
    <slot></slot>
    <label v-if="label">{{ label }}</label>
    <input :value="value" @input="$emit('input', $event.target.value)" :type="type" :name="name" :placeholder="placeholder" class="form-control" />

    <field-messages :state="formstate" :name="name" show="$touched || $submitted">
      <template>
        <span class="glyphicon glyphicon-ok form-control-feedback"></span>
      </template>
      <template v-for="(message, key) in messages" :slot="key">
        <span class="glyphicon glyphicon-remove form-control-feedback"></span>
        <span class="has-error">{{ message }}</span>
      </template>
    </field-messages>
  </div>
</template>

<script>
  export default {
    props: ['value', 'formstate', 'type', 'name', 'placeholder', 'label', 'messages']
  }
</script>
