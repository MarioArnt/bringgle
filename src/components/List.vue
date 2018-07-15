<template lang="pug">
  .list
    h1(v-if="error") Error occured
    h1(v-if="loaded") "Welcome in list {{  $route.params.id }}
</template>

<script>
import axios from '@/api'

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
      this.loaded = true
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
