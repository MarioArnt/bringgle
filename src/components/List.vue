<template lang="pug">
  .list
    h1(v-if="error") Error occured
    .list-content(v-if="loaded")
      h1 {{  list.title }}
      h3 Attendees
      div#attendees
        div.attendee(v-for="attendee in list.attendees")
          md-card(md-with-hover)
            md-ripple
              md-card-header
                div.md-title {{ attendee.name }}
                div.md-subhead {{ attendee.connected ? 'Online' : 'Offline' }}
      h3 Items
        ul
          li(v-for="item in list.items") {{ item.name }}
</template>

<script>
import axios from '@/api'
import router from '@/router'
import Logger from 'js-logger'
import io from 'socket.io-client'

function userConnectedOrDisconnected (connectedUsers, attendees) {
  Logger.info('Connected: ', connectedUsers)
  attendees.forEach(att => {
    att.connected = false
  })
  connectedUsers.forEach(usr => {
    attendees.find(att => att.id === usr).connected = true
  })
  Logger.debug(attendees)
}

export default {
  data: function () {
    return {
      loaded: false,
      error: false,
      list: {}
    }
  },
  name: 'List',
  created: function () {
    axios.get('lists/' + this.$route.params.id).then((res) => {
      Logger.debug('Loading list with ID', this.$route.params.id)
      if (res.data.attendees.some((att) => att.id === this.$store.state.currentUser.id)) {
        Logger.debug('Current user is an attendee', this.$store.state.currentUser)
        this.list = res.data
        this.loaded = true
        Logger.debug('List loaded', this.list)
        const socket = io('localhost:8081', {
          query: {
            userId: this.$store.state.currentUser.id,
            listId: this.list.id
          }
        })
        socket.on('user connected', connected => userConnectedOrDisconnected(connected, this.list.attendees))
        socket.on('user disconnected', connected => userConnectedOrDisconnected(connected, this.list.attendees))
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

<style scoped>

</style>
