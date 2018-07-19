<template lang='pug'>
  .create-list
    h1 Create new list
    form
      md-field
        label List Name
        md-input(v-validate="'required'" v-model="listName" placeholder='Awesome List' id='list-name' name="list-name" type='text' class='validate' required)
        span.md-error {{ errors.first('list-name') }}
      md-field
        label Email
        md-input(v-validate="'required|email'" v-model="userEmail" placeholder='john.doe@mail.com' id='user-email' name="user-email" type='email' class='validate' required)
        span.md-error {{ errors.first('user-email') }}
      md-field
        label Display Name
        md-input(v-validate="'required'" v-model="displayName" placeholder='John Doe' id='user-name' name="user-name" type='text' class='validate' required)
        span.md-error {{ errors.first('user-name') }}
      md-button.md-raised.md-accent(:disabled="errors.any() || buttonDisabled" v-on:click='sendData()')
        i.fa.fa-plus
        | Create
</template>

<script>
import axiosClient from '@/api'
import router from '@/router'
import cookiesUtils from '@/cookies'
import store from '@/store'
import Logger from 'js-logger'

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
    if (user && user.name && user.email) {
      Logger.debug('Using current user info for form', user)
      this.displayName = user.name || ''
      this.userEmail = user.email || ''
    }
  },
  methods: {
    sendData () {
      if (!this.errors.any()) {
        const postAsCurrentUser = (this.displayName === store.state.currentUser.name) && (this.userEmail === store.state.currentUser.email)
        this.buttonDisabled = true
        const payload = {
          displayName: this.displayName,
          listName: this.listName,
          userEmail: this.userEmail
        }
        if (postAsCurrentUser) {
          Logger.debug('Creating list as user', store.state.currentUser)
          payload.userId = store.state.currentUser.id
        } else Logger.debug('Creating list as new user')
        axiosClient.request({
          url: 'lists',
          method: 'post',
          data: payload
        }).then((res) => {
          this.$toastr.s('List successfully created')
          cookiesUtils.setUser(res.data.owner)
          router.push('/list/' + res.data.id)
          this.buttonDisabled = false
        }, (err) => {
          this.$toastr.e('Error happened')
          Logger.error('Error happened while creating list', err)
          this.buttonDisabled = false
        })
      }
    }
  }
}
</script>

<style scoped>

</style>
