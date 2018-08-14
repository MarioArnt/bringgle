<template lang="pug">
  .list
    error-page(v-if="$store.state.listStatus.error" :status="$store.state.listStatus.error" type="List")
    #list-main.md-layout(v-if="$store.state.listStatus.loaded")
      #list-attendees.md-xsmall-hide.md-elevation-7.md-layout-item.md-xsmall-size-100.md-small-size-33.md-medium-size-33.md-large-size-25.md-xlarge-size-20
        .list-attendee-wrapper
          md-list.md-double-line
            md-subheader Attendees
            md-list-item(v-for="attendee in $store.state.currentList.attendees" :key="attendee.id")
              .md-list-item-text
                span
                  .circle(:class="attendee.connected ? 'green' : 'red'")
                  | {{ attendee.name }}
                span.online {{ attendee.connected ? 'Online' : 'Offline' }}
              md-button.md-icon-button.md-list-action
                i.fa.fa-comments
            md-divider
          add-attendee
      #list-content.md-layout-item.md-xsmall-size-100.md-small-size-66.md-medium-size-66.md-large-size-75.md-xlarge-size-80
        .list-content-wrapper
          h1#list-title.ellipsis {{  $store.state.currentList.title }}
          md-tabs(@md-changed="tabChanged")
            template(slot="md-tab" slot-scope="{ tab }")
              | {{ tab.label }} 
              i.tab-badge.md-badge.md-theme-default.md-dense(v-if="tab.data.badge") {{ tab.data.badge }}
            md-tab(id="tab-items" md-label="Items")
            md-tab(v-if="xsmall" id="tab-attendees" md-label="Attendees")
            md-tab(id="tab-messages" md-label="Messages" :md-template-data="{ badge: $store.getters.unreadMessages.length }")
            md-tab(id="tab-history" md-label="History" :md-template-data="{ badge: $store.getters.unreadHistory.length }")
          router-view
</template>
<script lang="ts">
import ItemsList from '@/components/ItemsList'
import AddAttendee from '@/components/AddAttendee'
import ListsController from '@/controllers/lists'
import ErrorPage from '@/components/ErrorPage'
import History from '@/components/History'
import Messenger from '@/components/Messenger'
import SocketsUtils from '../sockets';
import Vue from 'vue';
import PerfectScrollbar from 'perfect-scrollbar'
import router from '@/router'

export default Vue.extend({
  data: function () {
    return {
      currentTab: 'tab-items',
      xsmall: false,
     }
  },
  name: 'List',
  components: { ItemsList, AddAttendee, ErrorPage, History, Messenger },
  beforeCreate: function () {
    this.$store.commit('clearListStatus')
  },
  created: function () {
    ListsController.fetchList(this.$route.params.id).catch((err) => {
      this.$toastr.e(err.msg);
    });
  },
  mounted() {
    router.push(`/list/${this.$route.params.id}/items`);
    const ps = new PerfectScrollbar('#list-attendees');
  },
  beforeDestroy: function () {
    SocketsUtils.destroySocket();
  },
  methods: {
    tabChanged(newTab) {
      this.currentTab = newTab;
      switch (newTab) {
        case 'tab-items':
        router.push(`/list/${this.$route.params.id}/items`);
        break;
      case 'tab-messages':
        router.push(`/list/${this.$route.params.id}/messages`);
        break;
      case 'tab-history':
        router.push(`/list/${this.$route.params.id}/history`);
        break;
      }
    }
  }
})
</script>

<style lang="scss" scoped>
@media screen and (min-width: 600px) {
  #items {
    padding-right: 30px
  }
}
.circle {
  height: 10px;
  width: 10px;
  border-radius: 50%;
  display: inline-block;
  margin: 0 5px;
  &.red {
    background-color: red;
  }
  &.green {
    background-color: green;
  }
}
.online {
  margin-left: 20px;
}
#list-attendees,
#list-content {
  height: calc(100vh - 64px);
}
#list-content {
  padding: 20px;
  padding-bottom: 0;
}
#list-title {
  margin: 10px 0;
  height: 28px;
}
.tab-badge {
  top: 5px;
  right: 0;
}
</style>
