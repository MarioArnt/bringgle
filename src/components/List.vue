<template lang="pug">
  .list
    h1(v-if="error") Error occured
    .list-content(v-if="loaded")
      h1 {{  list.title }}
      h3 Attendees
      ul
        li(v-for="attendee in list.attendees") {{ attendee.name }}
      h3 Items
        ul
          li(v-for="item in list.items") {{ item.name }}
</template>

<script>
import axios from '@/api'
import router from '@/router'
import Logger from 'js-logger'
import io from 'socket.io-client'

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
