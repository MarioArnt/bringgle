<template lang='pug'>
  .row
    h1 Create new list
    form.col.s12
        div.row
          div.input-field.col.s12
            input(placeholder='Awesome List' id='list-name' type='text' class='validate')
            label(for='list-name') List Name
        div.roW
          div.input-field.col.s12
            input(placeholder='john.doe@mail.com' id='user-email' type='text' class='validate')
            label(for='user-email') Email
        div.row
          div.input-field.col.s12
            input(placeholder='John Doe' id='user-name' type='text' class='validate')
            label(for='user-name') Display Name
        div.row
          div.input-field.col.s12
            a(v-on:click='sendData()').waves-effect.waves-light.btn
              i.fa.fa-plus
              | Create
</template>

<script>
import Api from '@/api'
import { required, maxLength } from 'vuelidate/lib/validators'

export default {
  name: 'Test',
  methods: {
    sendData () {
      return Api().get('posts')
    }
  },
  validations: {
    name: {
      required,
      maxLength: maxLength(150)
    }
  }
}
</script>

<style scoped>

</style>
