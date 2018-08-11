<template lang="pug">
  .list
    error-page(v-if="$store.state.listStatus.error" :status="$store.state.listStatus.error" type="List")
    #list-main.md-layout(v-if="$store.state.listStatus.loaded")
      #list-attendees.md-xsmall-hide.md-elevation-7.md-layout-item.md-xsmall-size-100.md-small-size-33.md-medium-size-33.md-large-size-25.md-xlarge-size-20
        md-list.md-double-line
          md-subheader Attendees
          md-list-item(v-for="attendee in $store.state.currentList.attendees")
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
        h1#list-title.ellipsis {{  $store.state.currentList.title }}
        md-tabs
          md-tab(id="tab-items" md-label="Items")
            items-list
          md-tab(v-if="xsmall" id="tab-attendees" md-label="Attendees")
          md-tab(id="tab-messages" md-label="Messages")
          md-tab(id="tab-history" md-label="History")

</template>
<script lang="ts">
import ItemsList from '@/components/ItemsList'
import AddAttendee from '@/components/AddAttendee'
import ListsController from '@/controllers/lists'
import ErrorPage from '@/components/ErrorPage'
import SocketsUtils from '../sockets';

export default {
  name: 'List',
  components: { ItemsList, AddAttendee, ErrorPage },
  beforeCreate: function () {
    this.$store.commit('clearListStatus')
  },
  created: function () {
    ListsController.fetchList(this.$route.params.id).catch((err) => {
      this.$toastr.e(err.msg);
    });
  },
  beforeDestroy: function () {
    SocketsUtils.destroySocket();
  }
}
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
#list-attendees {
  min-height: 100vh;
}
#list-content {
  padding: 20px;
}
#list-title {
  height: 28px;
}
</style>
