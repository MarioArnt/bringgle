<template lang="pug">
  .list
    error-page(v-if="$store.state.listStatus.error" :status="$store.state.listStatus.error" type="List")
    .list-content.md-layout(v-if="$store.state.listStatus.loaded")
      .md-layout-item.md-size-100
        h1.ellipsis {{  $store.state.currentList.title }}
      #items.md-layout-item.md-xsmall-size-100.md-small-size-66.md-medium-size-66.md-large-size-75.md-xlarge-size-80
        h3 Items
        items-list
      #attendees.md-layout-item.md-xsmall-size-100.md-small-size-33.md-medium-size-33.md-large-size-25.md-xlarge-size-20
        h3 Attendees
        div.attendee(v-for="attendee in $store.state.currentList.attendees")
            md-card(md-with-hover)
              md-card-header
                div.md-title.ellipsis {{ attendee.name }}
                div.md-subhead
                  div.circle(:class="attendee.connected ? 'green' : 'red'")
                  | {{ attendee.connected ? 'Online' : 'Offline' }}
              md-card-actions
                md-button.md-dense.md-primary
                  i.fa.fa-check
                  span Items
                md-button.md-dense.md-primary
                  i.fa.fa-comments
                  span Chat
        add-attendee
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
#attendees {
  .attendee {
    margin: 5px 0;
    .circle {
      height: 10px;
      width: 10px;
      border-radius: 50%;
      display: inline-block;
      margin-right: 5px;
      &.red {
        background-color: red;
      }
      &.green {
        background-color: green;
      }
    }
  }
}
</style>
