<template lang="pug">
    #messenger
      #messages(ref="messages")
          h1.no-message.primary-lighter(v-if="$store.state.currentList.messages.length === 0") No messages yet...
          message(v-for="(message, index) in orderedMessages" :from="message.from" :date="message.sent" :content="message.msg" :key="message.id" :previous="index !== 0 ? orderedMessages[index - 1] : null")
          .typing(v-if="usersTyping.length > 0")
            .three-dots.md-elevation-2
              .dot
              .dot
              .dot
            i {{formattedTyping}}
      #new-message
        md-field
          label Your message
          md-textarea(v-model="newMessage" md-autogrow @keydown="inputHandler")
          span.md-helper-text {{ this.hint }}
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
import Logger from 'js-logger';
import SocketsUtils from '@/sockets';
import Tabs from '@/constants/tabs';

let typingTimeout = null;
let typing = false;
const defaultHint = 'Enter: Send / Shift + Enter: New line';

export default Vue.extend({
  data: function() {
    return {
      newMessage: '',
      hint: defaultHint,
    }
  },
  computed: {
    orderedMessages () {
      return this.$store.getters.orderedMessages;
    },
    usersTyping () {
      return this.$store.getters.whoIsTyping;
    },
    formattedTyping () {
      if (this.usersTyping.length < 1) {
        return '';
      }
      if (this.usersTyping.length === 1) {
        return `${this.usersTyping[0].name} is typing`;
      } else {
        let formatted = '';
        this.usersTyping.forEach((usr, key, arr) => {
          if (Object.is(arr.length - 2, key)) {
            formatted += `${usr.name} and `;
          }
          else if (Object.is(arr.length - 1, key)) {
            formatted += usr.name;
          } else {
            formatted += `${usr.name}, `;
          }
        });
        formatted += ' are typing';
        return formatted;
      }
    }
  },
  watch: {
    orderedMessages: function() {
      this.scrollToLastMessage();
    },
    usersTyping: function() {
      this.scrollToLastMessage();
    }
  },
  mounted() {
    this.$store.commit('switchTab', Tabs.MESSAGES);
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
        typing = false;
        SocketsUtils.stopTyping();
        this.sendMessage();
      } else {
        this.imTyping();
      }
    },
    scrollToLastMessage() {
      setTimeout(() => {
        const messages = this.$refs.messages;
        messages.scrollTop = messages.scrollHeight;
      }, 0);
    },
    imTyping() {
      if(!typing) {
        Logger.debug('You start typing');
        SocketsUtils.startTyping();
        typing = true;
      }
      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        Logger.debug('You stop typing');
        typing = false;
        SocketsUtils.stopTyping();
      }, 1200);
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
  @keyframes blink {
    0% {
      opacity: .2;
    }
    20% {
      opacity: 1;
    }
    100% {
      opacity: .2;
    }
  }
  $dot-size: 8px;
  $cell-height: 30px;
  $cell-width: 50px;
  .typing {
    margin-left: auto;
    margin-right: 10px;
    padding: 5px 10px;
    max-width: 60%;
    margin-top: 10px;
    text-align: right;
    .three-dots {
      border-radius: 5px;
      width: $cell-width;
      height: $cell-height;
      display: flex;
      margin-left: auto;
      margin-right: 0;
      margin-bottom: 5px;
      padding: 0.5*($cell-height - $dot-size) 0.5*($cell-width - 4*$dot-size);
      .dot {
        animation-name: blink;
        animation-duration: 1.4s;
        animation-iteration-count: infinite;
        animation-fill-mode: both;
        height: $dot-size;
        width: $dot-size;
        border-radius: 50%;
        background-color: black;
        &:nth-child(2) {
          animation-delay: .2s;
          margin-left: $dot-size*0.5;
        }
        &:nth-child(3) {
          animation-delay: .4s;
          margin-left: $dot-size*0.5;
        }
      }
    }
  }
</style>
