<template lang='pug'>
  .create-list
    h1 Create new list
    form
      md-field(:class="{'md-invalid': errors.has('list name')}")
        label List Name
        md-input(v-validate="'required'" v-model="listName" placeholder='Awesome List' id='list-name' name="list name" type='text' class='validate' v-on:keyup.enter="sendData()" required)
        span.md-error {{ errors.first('list name') }}
      md-field(:class="{'md-invalid': errors.has('email')}")
        label Email
        md-input(v-validate="'required|email'" v-model="userEmail" placeholder='john.doe@mail.com' id='user-email' name="email" type='email' class='validate' v-on:keyup.enter="sendData()" required)
        span.md-error {{ errors.first('email') }}
      md-field(:class="{'md-invalid': errors.has('display name')}")
        label Display Name
        md-input(v-validate="'required'" v-model="displayName" placeholder='John Doe' id='user-name' name="display name" type='text' class='validate' v-on:keyup.enter="sendData()" required)
        span.md-error {{ errors.first('display name') }}
      md-button.md-raised.md-accent(:disabled="errors.any() || buttonDisabled" v-on:click='sendData()')
        i.fa.fa-plus
        | Create
</template>

<script lang="ts">
import ListsController from '../controllers/lists'
import Logger from 'js-logger'

const listsController: ListsController = new ListsController();

export default {
  name: 'CreateList',
  data: function () {
    return {
      buttonDisabled: false,
      displayName: '',
      userEmail: '',
      listName: ''
    }
  },
  created: function () {
    let user = this.$store.state.currentUser
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
          listsController.createList(this.listName, this.displayName, this.userEmail).then(() => {
            this.$toastr.s('List successfully created')
            this.buttonDisabled = false
          }, (err) => {
            this.$toastr.e('Error happened')
            Logger.error('Error happened while creating list', err)
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
