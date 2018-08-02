<template lang="pug">
  .list
    h1(v-if="$store.state.listStatus.error") Error occured
    .list-content(v-if="$store.state.listStatus.loaded")
      h1 {{  $store.state.currentList.title }}
      div#attendees
        h3 Attendees
        div.attendee(v-for="attendee in $store.state.currentList.attendees")
            md-card(md-with-hover)
              md-ripple
                md-card-header
                  div.md-title {{ attendee.name }}
                  div.md-subhead
                    div.circle(:class="attendee.connected ? 'green' : 'red'")
                    | {{ attendee.connected ? 'Online' : 'Offline' }}
      div#items
        h3 Items
        items-list
</template>

<script>
import ItemsList from '@/components/ItemsList'
import ListsController from '@/controllers/lists'

export default {
  data: function () {
    return { }
  },
  name: 'List',
  components: { ItemsList },
  beforeCreate: function () {
    this.$store.commit('clearListStatus')
  },
  created: function () {
    ListsController.fetchList(this.$route.params.id)
  },
  beforeDestroy: function () {
    // Disconnect socket
  }
}
</script>

<style lang="scss" scoped>
$attendees-panel-width: 25%;
#attendees {
  width: $attendees-panel-width;
  float: right;
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
#items {
  width: 100% - $attendees-panel-width;
}
</style>
