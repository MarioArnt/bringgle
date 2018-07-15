<template lang="pug">
  nav
    div.nav-wrapper
      router-link.brand-logo(to="/") Bringgle
      ul#nav-mobile.right
        li(v-if="user")
          i.fa.fa-user
          | {{ user.name }}
        li
          router-link(to="/create")
            i.fa.fa-plus
            | Create list
</template>

<script>
import cookiesUtils from '@/cookies'
export default {
  name: 'Header',
  data: function () {
    return {
      user: {}
    }
  },
  created: function () {
    this.user = cookiesUtils.getUser()
  },
  methods: {
    refreshUser: function () {
      this.user = cookiesUtils.getUser()
    }
  }
}
</script>

<style scoped>
  nav {
    padding: 0 10px;
  }
</style>
