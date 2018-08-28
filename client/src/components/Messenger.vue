<template lang="pug">
    #messenger
      #messages(ref="messages")
          h1.no-message.primary-lighter(v-if="$store.state.currentList.messages.length === 0") No messages yet...
          message(v-for="(message, index) in orderedMessages" :from="message.from" :date="message.sent" :content="message.msg" :key="message.id" :previous="index !== 0 ? orderedMessages[index - 1] : null")
      #new-message
        md-field
          label Your message
          md-textarea(v-model="newMessage" md-autogrow @keydown="inputHandler")
          span.md-helper-text Enter: Send / Shift + Enter: New line
        #send-button.md-button.md-icon-button(v-on:click="sendMessage()")
          i.fa.fa-send
</template>

<script lang="ts">
import Vue from 'vue';
import axios from '@/api';
import store from '@/store';
import moment from 'moment';
import Message from '@/components/Message'
import VueScrollTo from 'vue-scrollto';
import PerfectScrollbar from 'perfect-scrollbar';


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
  watch: {
    orderedMessages: function() {
      this.scrollToLastMessage();
    }
  },
  mounted() {
    const ps = new PerfectScrollbar('#messages');
    this.scrollToLastMessage();
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
    inputHandler(e) {
      if (e.keyCode === 13 && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    },
    scrollToLastMessage() {
      setTimeout(() => {
        const messages = this.$refs.messages;
        messages.scrollTop = messages.scrollHeight;
      }, 0);
    }
  }
})
</script>

<style lang="scss" scoped>
  .no-message {
    font-weight: normal;
  }
  $header-size: 64px;
  $main-content-padding: 20px;
  $title-height: 28px;
  $tab-height: 48px;
  $send-msg-height: 80px;
  $offset: $header-size + $main-content-padding + $tab-height + $title-height + $send-msg-height;
  #messages {
    height: calc(100vh - 292px);
    position: relative;
    padding-bottom: 10px;
    overflow: hidden;
  }
  #new-message {
    height: 80px;
    display: flex;
    align-items: baseline;
    #send-button {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
</style>
