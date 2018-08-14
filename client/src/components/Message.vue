<template lang="pug">
  .message-wrapper(:class="{'sent-by-me': from.id === $store.state.currentUser.id}")
    p.date-sent(v-if="sendAtLeastTenMinutesAfterPrevious()")  {{formattedDate}}
    p(v-if="sentBySameUserThanPrevious()") 
      strong {{from.name}}
    .message.md-elevation-2
      p {{content}}
</template>

<script lang="ts">
import Vue from 'vue'
import DateHelpers from '@/helpers/date';
import moment from 'moment';

export default Vue.extend({
  data: function () {
    return {
      now: Date.now(),
      formattedDate: DateHelpers.format(this.date),
     }
  },
  props: ['from', 'content', 'date', 'previous'],
  name: 'Message',
  created: function() {
    setInterval(() => {
      this.now = Date.now();
    }, 1000);
  },
  watch: {
    now: function () {
      this.formattedDate =  DateHelpers.format(this.date);
    }
  },
  methods: {
    sentBySameUserThanPrevious() {
      return !this.previous || this.from.id !== this.previous.from.id;
    },
    sendAtLeastTenMinutesAfterPrevious() {
      return !this.previous || moment(this.date).isAfter(moment(this.previous.sent).add(10, 'm'));
    }
  }
})
</script>

<style lang="scss" scoped>
  .message-wrapper {
      text-align: right;
    .date-sent {
      color: lightslategrey;
    }
    .message {
      border-radius: 5px;
      padding: 5px 10px;
      max-width: 60%;
      margin-right: 0;
      margin-top: 10px;
      margin-left: auto;
    }
    &.sent-by-me {
      text-align: left;
      .message {
        margin-right: auto;
        margin-left: 0;
        background-color: #7e57c2;
        color: white;
      }
    }
  }
</style>
