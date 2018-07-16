<template lang="pug">
  .list
    h1(v-if="error") Error occured
    h1(v-if="loaded") "Welcome in list {{  list.title }}
</template>

<script>
import axios from '@/api'
import router from '@/router'

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
      if (res.data.attendees.some((att) => att.id === this.$store.currentUser.id)) {
        console.log('Current user is an attendee')
        this.list = res.data
        console.log('List loaded')
        console.log(this.list)
        this.loaded = true
      } else {
        router.push('list/' + res.data.id + '/join')
      }
      console.log(res.data)
    }, (err) => {
      this.error = true
      console.log(err)
    })
  }
}
</script>

<style scoped>

</style>
