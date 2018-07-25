<template lang="pug">
  .list
    h1(v-if="error") Error occured
    .list-content(v-if="loaded")
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
          ul
            li(v-for="item in $store.state.currentList.items") {{ item.name }}
</template>

<script>
import axios from '@/api'
import router from '@/router'
import Logger from 'js-logger'
import io from 'socket.io-client'

function userConnectedOrDisconnected (store, connected) {
  Logger.info('Connected: ', connected)
  store.commit('changeConnectedUsers', connected)
}

export default {
  data: function () {
    return {
      loaded: false,
      error: false
    }
  },
  name: 'List',
  created: function () {
    axios.get('lists/' + this.$route.params.id).then((res) => {
      Logger.debug('Loading list with ID', this.$route.params.id)
      if (res.data.attendees.some((att) => att.id === this.$store.state.currentUser.id)) {
        Logger.debug('Current user is an attendee', this.$store.state.currentUser)
        this.$store.commit('changeCurrentList', res.data)
        this.loaded = true
        Logger.debug('List loaded', this.$store.state.currentList)
        const socket = io('localhost:8081', {
          query: {
            userId: this.$store.state.currentUser.id,
            listId: this.$store.state.currentList.id
          }
        })
        socket.on('user connected', connected => userConnectedOrDisconnected(this.$store, connected))
        socket.on('user disconnected', connected => userConnectedOrDisconnected(this.$store, connected))
        Logger.info('Socket created', socket)
      } else {
        Logger.info('Current user is not an attendee, redirecting...', this.$store.state.currentUser)
        router.push('/list/' + res.data.id + '/join')
      }
    }, (err) => {
      this.error = true
      Logger.error('Error happened while loading the list', err)
    })
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
