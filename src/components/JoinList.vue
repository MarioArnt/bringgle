<template lang='pug'>
  .join-list
    h1 Join list
    form
      md-field
        label Email
        md-input(v-validate="'required|email'" v-model="userEmail" placeholder='john.doe@mail.com' id='user-email' name="user-email" type='email' class='validate' required)
        span.md-error {{ errors.first('user-email') }}
      md-field
        label  Display Name
        md-input(v-validate="'required'" v-model="displayName" placeholder='John Doe' id='user-name' name="user-name" type='text' class='validate' required)
        span.md-error {{ errors.first('user-name') }}
      md-button.md-raised.md-accent(:disabled="errors.any() || buttonDisabled" v-on:click='sendData()')
        i.fa.fa-plus
        | Join
</template>

<script>
import axiosClient from '@/api'
import router from '@/router'
import cookiesUtils from '@/cookies'
import store from '@/store'
import Logger from 'js-logger'

export default {
  name: 'JoinList',
  data: function () {
    return {
      buttonDisabled: false,
      displayName: '',
      userEmail: ''
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
        const postAsCurrentUser = (this.displayName === store.state.currentUser.name) && (this.userEmail === store.state.currentUser.email)
        this.buttonDisabled = true
        const payload = {
          displayName: this.displayName,
          userEmail: this.userEmail
        }
        if (postAsCurrentUser) {
          Logger.debug('Creating list as user', store.state.currentUser)
          payload.userId = store.state.currentUser.id
        } else Logger.debug('Creating list as new user')
        axiosClient.request({
          url: 'lists/' + this.$route.params.id + '/join',
          method: 'post',
          data: payload
        }).then((res) => {
          this.$toastr.s('Yay ! You join the list')
          cookiesUtils.setUser(res.data.attendee)
          store.commit('changeCurrentUser', cookiesUtils.getUser())
          router.push('/list/' + res.data.listId)
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
