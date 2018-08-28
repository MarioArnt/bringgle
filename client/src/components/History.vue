<template lang="pug">
  #history
    md-list
      md-list-item(v-for="action in $store.getters.orderedHistory" :key="action.id")
        p.md-list-item-text 
          span {{humanReadable(action)}} 
          span.date {{formatTime(action.date)}}
</template>

<script lang="ts">
import Vue from 'vue';
import Actions from '../../../server/src/constants/actions';
import moment from 'moment'
import store from '@/store'
import DateHelpers from '@/helpers/date'
import PerfectScrollbar from 'perfect-scrollbar';

export default Vue.extend({
  name: 'History',
  mounted() {
    const ps = new PerfectScrollbar('#history');
  },
  methods: {
    humanReadable(action) {
      switch(action.code) {
        case Actions.CREATED_LIST.code:
          return `${action.by.name} created list ${this.$store.state.currentList.title}`;
        case Actions.JOINED_LIST.code:
          return `${action.by.name} joined list ${this.$store.state.currentList.title}`;
        case Actions.INVITED_USER.code:
          return `${action.by.name} invited user ${action.newValue}`;
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
      return DateHelpers.format(date);
    }
  }
});
</script>

<style lang="scss" scoped>
  #history {
    height: calc(100vh - 212px);
    position: relative;
    overflow: hidden;
  }
  span.date {
    color: lightslategrey;
  }
</style>
