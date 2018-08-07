<template lang="pug">
  #invite-attendee
    md-dialog(:md-active.sync="showAddAttendeeDialog")
      md-dialog-title Invite a friend
      md-dialog-content
        p Please enter your friend's email address to invite him attend this list
        md-field(:class="{'md-invalid': errors.has('email')}")
          label Email
          md-input(v-validate="'required|email'" v-model="friendEmail" placeholder='your.friend@mail.com' id='friend-email' name="email" type='email' class='validate' v-on:keyup.enter="sendInvitation()" required)
          span.md-error {{ errors.first('email') }}
        md-button.md-raised.md-accent#invite-button(v-on:click="sendInvitation()")
          i.fa.fa-send
          span Send Invitation
    md-button.md-raised.md-accent#invite-button(v-on:click="reset()")
      i.fa.fa-send
      span Invite a friend
</template>

<script lang="ts">
import Vue from 'vue'
import Logger from 'js-logger'
import ListsController from '@/controllers/lists'

export default Vue.extend({
  name: 'AddAttendee',
  data: function () {
    return {
      showAddAttendeeDialog: false,
      friendEmail: ''
    }
  },
  methods: {
    reset() {
      this.friendEmail = ''
      this.showAddAttendeeDialog = true
    },
    sendInvitation() {
      this.$validator.validate().then((valid) => {
        if (valid) {
          Logger.debug('Sending invitation')
          ListsController.inviteAttendee(this.$store.state.currentList.id, this.friendEmail).then(() => {
            this.$toastr.s('Email successfully sent')
            this.showAddAttendeeDialog = false
          }, (err) => {
            Logger.error('Something wrong happened', err)
            this.$toastr.e('Error happened while sending email')
          })
        }
      })
    }
  }
})
</script>

<style lang="scss" scoped>
#invite-button {
  margin-left: 0;
}
</style>

