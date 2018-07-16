<template lang='pug'>
  .row
    h1 Join list
    form.col.s12
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
            | Join
</template>

<script>
import axiosClient from '@/api'
import router from '@/router'
import cookiesUtils from '@/cookies'
import store from '@/store'

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
        if (postAsCurrentUser) payload.userId = store.state.currentUser.id
        axiosClient.request({
          url: 'list/' + this.$route.params.id + '/join',
          method: 'post',
          data: payload
        }).then((res) => {
          this.$toastr.s('Yay ! You join the list')
          cookiesUtils.setUser(res.data.attendee)
          store.commit('changeCurrentUser', cookiesUtils.getUser())
          router.push('list/' + res.data.listId)
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
