<template lang="pug">
  #new-item.md-layout.md-alignment-center
    #qty
      md-field
        label Quantity
        md-input(v-model="$store.state.newItem.quantity" type="number")
    #new-item
      md-field
        label Item
        md-input(v-model="$store.state.newItem.name" v-on:keyup.enter="submitItem()")
    #add-item
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
#new-item {
  flex-wrap: nowrap;
  #qty {
    width: 70px;
  }
  #new-item {
    flex: 1;
    padding-left: 10px
  }
  #add-item {
    width: 40px;
    button {
      margin: 0
    }
  }
}
</style>
