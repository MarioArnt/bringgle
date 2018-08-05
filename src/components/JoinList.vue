<template lang='pug'>
  .join-list
    h1 Join list
    form
      md-field(:class="{'md-invalid': errors.has('email')}")
        label Email
        md-input(v-validate="'required|email'" v-model="userEmail" placeholder='john.doe@mail.com' id='user-email' name="email" type='email' class='validate'  v-on:keyup.enter="sendData()" required)
        span.md-error {{ errors.first('email') }}
      md-field(:class="{'md-invalid': errors.has('display name')}")
        label  Display Name
        md-input(v-validate="'required'" v-model="displayName" placeholder='John Doe' id='user-name' name="display name" type='text' class='validate'  v-on:keyup.enter="sendData()" required)
        span.md-error {{ errors.first('display name') }}
      md-button.md-raised.md-accent(:disabled="errors.any() || buttonDisabled" v-on:click='sendData()')
        i.fa.fa-plus
        | Join
</template>

<script lang="ts">
import ListsController from '../controllers/lists'
import store from '../store'
import Logger from 'js-logger'

const listsController: ListsController = new ListsController();

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
    if (user && user.name && user.email) {
      Logger.debug('Using current user info for form', user)
      this.displayName = user.name || ''
      this.userEmail = user.email || ''
    }
  },
  methods: {
    sendData () {
      this.$validator.validate().then((valid) => {
        if (valid) {
          this.buttonDisabled = true
          listsController.joinList(this.$route.params.id, this.displayName, this.userEmail).then(() => {
            this.buttonDisabled = false
            this.$toastr.s('Yay ! You join the list')
          }, (err) => {
            this.$toastr.e('Error happened')
            Logger.error('Error happened while joining list', err)
            this.buttonDisabled = false
          })
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
