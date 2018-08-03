<template lang="pug">
  .items-container
    md-dialog(:md-active.sync="showDialog")
      md-dialog-title Preferences
      md-dialog-content
        .sub-item(v-for="i in selectedItem.quantity")
          md-checkbox(v-model="selectedItem.responsible[i] !== undefined" v-on:change="bringItem(selectedItem, i)")
            span.item-name {{ selectedItem.name }} {{`#${i}`}}
            span.brought-by(v-if="selectedItem.responsible[i]")  | {{ selectedItem.responsible[i].name }}
    div.item(v-for="item in $store.state.currentList.items")
      .md-layout.md-alignment-center-space-between(v-if="!item.edit")
        #item-checkbox
          md-checkbox(v-if="item.quantity === 1" v-model="Object.keys(item.responsible).length === 1" v-on:change="bringItem(item, 0)")
            span.item-name {{ item.name }}
            span.brought-by(v-if="item.responsible[0]")  | {{ item.responsible[0].name }}
          md-checkbox(v-if="item.quantity > 1" v-on:change="openItemDetails(item)")
            span.item-name {{ item.name }}
            span.brought-by  ({{ Object.keys(item.responsible).length }}/{{ item.quantity}})
        #item-menu
          md-menu(md-direction="bottom-end")
            md-button.md-icon-button(md-menu-trigger)
              i.fa.fa-ellipsis-v
            md-menu-content
              md-menu-item(v-on:click="editItem(item)")
                span
                  i.fa.fa-edit
                  | Edit
              md-menu-item(v-on:click="removeItem(item)")
                span
                  i.fa.fa-trash
                  | Remove
      add-item(v-if="item.edit" :item-id='item.id' :item-name="item.name" :item-quantity="item.quantity")
    add-item
</template>

<script>
import Logger from 'js-logger'
import ItemsController from '@/controllers/items'
import AddItem from '@/components/AddItem'
import Vue from 'vue'

export default {
  name: 'ItemsList',
  components: { AddItem },
  data: function () {
    return {
      showDialog: false,
      selectedItem: {}
    }
  },
  methods: {
    bringItem (item, sub) {
      ItemsController.bringItem(item, sub)
    },
    openItemDetails (item) {
      this.selectedItem = item
      this.showDialog = true
    },
    editItem (item) {
      Logger.info(`User ${this.$store.state.currentUser.name} edit item ${item.name}`)
      Vue.set(item, 'edit', true)
    },
    removeItem (item) {
      Logger.info(`User ${this.$store.state.currentUser.name} remove item ${item.name}`)
      ItemsController.removeItem(item.id)
    }
  }
}
</script>

<style lang="scss" scoped>
  .brought-by {
    color: lightslategrey;
  }
  #item-checkbox {
    flex: 1
  }
  #item-menu {
    width: 40px
  }
</style>
