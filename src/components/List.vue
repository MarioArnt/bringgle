<template lang="pug">
  .list
    h1(v-if="$store.state.listStatus.error") Error occured
    .list-content.md-layout(v-if="$store.state.listStatus.loaded")
      .md-layout-item.md-size-100
        h1 {{  $store.state.currentList.title }}
      #items.md-layout-item.md-xsmall-size-100.md-small-size-66.md-medium-size-75
        h3 Items
        items-list
      #attendees.md-layout-item.md-xsmall-size-100.md-small-size-33.md-medium-size-25
        h3 Attendees
        div.attendee(v-for="attendee in $store.state.currentList.attendees")
            md-card(md-with-hover)
              md-ripple
                md-card-header
                  div.md-title {{ attendee.name }}
                  div.md-subhead
                    div.circle(:class="attendee.connected ? 'green' : 'red'")
                    | {{ attendee.connected ? 'Online' : 'Offline' }}
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
