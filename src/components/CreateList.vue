<template lang='pug'>
  .row
    vue-toastr(ref="toastr")
    h1 Create new list
    form.col.s12
      div.row
        div.input-field.col.s12
          input(v-validate="'required'" v-model="listName" placeholder='Awesome List' id='list-name' name="list-name" type='text' class='validate' required)
          label(for='list-name') List Name
          span.helper-text(:data-error="errors.first('list-name')")
          span {{ errors.first('list-name') }}
      div.row
        div.input-field.col.s12
          input(v-validate="'required|email'" v-model="email" placeholder='john.doe@mail.com' id='user-email' name="user-email" type='email' class='validate' required)
          label(for='user-email') Email
          span.helper-text(:data-error="errors.first('user-email')")
          span {{ errors.first('user-email') }}
      div.row
        div.input-field.col.s12
          input(v-validate="'required'" v-model="displayName" placeholder='John Doe' id='user-name' name="user-name" type='text' class='validate' required)
          label(for='user-name') Display Name
          span.helper-text(:data-error="errors.first('user-name')")
          span {{ errors.first('user-name') }}
      div.row
        div.input-field.col.s12
          a(:disabled="errors.any()" v-on:click='sendData()').waves-effect.waves-light.btn
            i.fa.fa-plus
            | Create
</template>

<script>
import axiosClient from '../api/index.js'

export default {
  name: 'Test',
  data: function () {
    return {
      displayName: '',
      email: '',
      listName: ''
    }
  },
  methods: {
    sendData () {
      if (!this.errors.any()) {
        axiosClient.request({
          url: 'lists',
          method: 'post',
          data: {
            displayName: this.displayName,
            listName: this.listName,
            userEmail: this.userEmail
          }
        }).then((res) => {
          this.$toastr.s('List successfully created')
        }, (err) => {
          this.$toastr.e('Error happened')
          console.log(err)
        })
      }
    }
  }
}
</script>

<style scoped>

</style>
