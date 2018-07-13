<template lang="pug">
  nav
    div.nav-wrapper
      router-link.brand-logo(to="/") Bringgle
      ul#nav-mobile.right
        li
          router-link(to="/create")
            i.fa.fa-plus
            | Create list
</template>

<script>
export default {
  name: 'Header'
}
</script>

<style scoped>
  nav {
    padding: 0 10px;
  }
</style>
