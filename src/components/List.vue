<template lang="pug">
  .list
    h1(v-if="error") Error occured
    h1(v-if="loaded") "Welcome in list {{  list.title }}
</template>

<script>
import axios from '@/api'
import router from '@/router'
import Logger from 'js-logger'

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
      if (res.data.attendees.some((att) => att.id === this.$store.state.currentUser.id)) {
        Logger.debug('Current user is an attendee')
        this.list = res.data
        this.loaded = true
        Logger.debug('List loaded', this.list)
      } else {
        Logger.info('Current user is not an attendee, redirecting...')
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
