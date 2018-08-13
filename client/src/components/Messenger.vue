<template lang="pug">
    #messenger
      #messages
        h1.no-message.primary-lighter(v-if="$store.state.currentList.messages.length === 0") No messages yet...
        message(v-for="(message, index) in orderedMessages" :from="message.from" :date="message.sent" :content="message.msg" :key="message.id" :previous="index !== 0 ? orderedMessages[index - 1] : null")
      #new-message
        md-field
          label Your message
          md-textarea(v-model="newMessage" md-autogrow)
        .md-button.md-icon-button(v-on:click="sendMessage()")
          i.fa.fa-send
</template>

<script lang="ts">
import Vue from 'vue';
import axios from '@/api';
import store from '@/store';
import moment from 'moment';
import Message from '@/components/Message'

export default Vue.extend({
  data: function() {
    return {
      newMessage: ''
    }
  },
  computed: {
    orderedMessages () {
      return this.$store.getters.orderedMessages
    }
  },
  components: {Message},
  name: 'Messenger',
  methods: {
    sendMessage() {
      if(!!this.newMessage) {
        axios.post('lists/' + this.$route.params.id + '/messages', {
          userId: this.$store.state.currentUser.id,
          content: this.newMessage
        }).then(() => {
          this.newMessage = '';
        }, (err) => {
          this.$toastr.e('Your message could not be sent');
        });
      }
    },
  }
})
</script>

<style lang="scss" scoped>
  .no-message {
    font-weight: normal;
  }
  #new-message {
    display: flex;
    align-items: baseline;
  }
</style>
