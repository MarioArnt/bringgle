<template lang='pug'>
  .row
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
          input(v-validate="'required|email'" v-model="userEmail" placeholder='john.doe@mail.com' id='user-email' name="user-email" type='email' class='validate' required)
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
          a(:disabled="errors.any() || buttonDisabled" v-on:click='sendData()').waves-effect.waves-light.btn
            i.fa.fa-plus
            | Create
</template>

<script>
import axiosClient from '@/api'
import router from '@/router'
import cookiesUtils from '@/cookies'
import store from '@/store'

export default {
  name: 'Test',
  data: function () {
    return {
      buttonDisabled: false,
      displayName: '',
      userEmail: '',
      listName: ''
    }
  },
  created: function () {
    let user = store.state.currentUser
    if (user) {
      this.displayName = user.name || ''
      this.userEmail = user.email || ''
    }
  },
  methods: {
    sendData () {
      if (!this.errors.any()) {
        this.buttonDisabled = true
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
          cookiesUtils.setUser(res.data.owner)
          store.commit('changeCurrentUser', cookiesUtils.getUser())
          router.push('list/' + res.data.id)
          this.buttonDisabled = false
        }, (err) => {
          this.$toastr.e('Error happened')
          console.log(err)
          this.buttonDisabled = false
        })
      }
    }
  }
}
</script>

<style scoped>

</style>
