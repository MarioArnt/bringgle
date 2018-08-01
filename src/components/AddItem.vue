<template lang="pug">
  .new-item
    .md-layout.md-gutter.md-alignment-center
    .md-layout-item#qty
      md-field
        label Quantity
        md-input(v-model="$store.state.newItem.quantity" type="number")
    .md-layout-item#new-item
      md-field
        label Item
        md-input(v-model="$store.state.newItem.name" v-on:keyup.enter="submitItem()")
    .md-layout-item#add-item
      md-button.md-icon-button(v-on:click="submitItem()")
        i.fa.fa-plus
</template>

<script>
import ItemsController from '@/controllers/items'

export default {
  data: function () {
    return {}
  },
  name: 'AddItem',
  methods: {
    submitItem: function () {
      ItemsController.addItem()
    }
  }
}
</script>

<style lang="scss" scoped>
  #qty {
    width: 80px;
  }
  #new-item {
    flex: 1;
  }
  #add-item {
    width: 80px;
  }
</style>
