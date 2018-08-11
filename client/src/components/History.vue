<template lang="pug">
  md-list
    md-list-item(v-for="action in orderedHistory" :key="action.id")
      p.md-list-item-text 
        span {{humanReadable(action)}} 
        span.date {{formatTime(action.date)}}
</template>

<script lang="ts">
import Vue from 'vue';
import Actions from '../../../server/src/constants/actions';
import moment from 'moment'
import store from '@/store'

export default Vue.extend({
  computed: {
    orderedHistory: function () {
      return store.state.currentList.history.sort((a, b) => moment(b.date).valueOf() - moment(a.date).valueOf());
    }
  },
  name: 'History',
  methods: {
    humanReadable(action) {
      switch(action.code) {
        case Actions.CREATED_LIST.code:
          return `${action.by.name} created list ${this.$store.state.currentList.title}`;
        case Actions.JOINED_LIST.code:
          return `${action.by.name} joined list ${this.$store.state.currentList.title}`;
        case Actions.INVITED_USER.code:
          return `${action.by.name} invite user ${action.newValue}`;
        case Actions.ADDED_ITEM.code:
          return `${action.by.name} added item ${action.itemName}`;
        case Actions.UPDATED_ITEM_NAME.code:
          return `${action.by.name} updated item name ${action.oldValue} to ${action.newValue}`;
        case Actions.UPDATED_ITEM_QUANTITY.code:
          return `${action.by.name} updated item ${action.itemName} quantity from ${action.oldValue} to ${action.newValue}`;
        case Actions.REMOVED_ITEM.code:
          return `${action.by.name} removed item ${action.itemName}`;
      }
    },
    formatTime(date): string {
      const actionDate = moment(date);
      const now = moment();
      if (!actionDate.isBefore(now.subtract(1, 'd'))) return actionDate.fromNow();
      if( actionDate.year()!== now.year()) return actionDate.format('MMMM Do YYYY - HH:mm');
      return actionDate.format('MMMM Do - HH:mm');
    }
  }
});
</script>

<style lang="scss" scoped>
  span.date {
    color: lightslategrey;
  }
</style>
