<template lang="pug">
  .list
    h1(v-if="error") Error occured
    .list-content(v-if="loaded")
      h1 {{  $store.state.currentList.title }}
      div#attendees
        h3 Attendees
        div.attendee(v-for="attendee in $store.state.currentList.attendees")
            md-card(md-with-hover)
              md-ripple
                md-card-header
                  div.md-title {{ attendee.name }}
                  div.md-subhead
                    div.circle(:class="attendee.connected ? 'green' : 'red'")
                    | {{ attendee.connected ? 'Online' : 'Offline' }}
      div#items
        h3 Items
        .items-container
          div.item(v-for="item in $store.state.currentList.items")
            .md-layout.md-gutter.md-alignment-center-space-between
              .md-layout-item
                md-checkbox(v-if="item.quantity === 1" v-model="item.responsible.length === 1" v-on:change="bringItem(item)") {{ item.name }}
                md-checkbox(v-if="item.quantity > 1" indeterminate v-on:change="bringItem(item)") {{ item.name }}
              .md-layout-item
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
        .md-layout.md-gutter.md-alignment-center
          .md-layout-item#qty
            md-field
              label Quantity
              md-input(v-model="newItem.qty" type="number")
          .md-layout-item#new-item
            md-field
              label Item
              md-input(v-model="newItem.label" v-on:keyup.enter="submitItem()")
          .md-layout-item#add-item
            md-button.md-icon-button(v-on:click="submitItem()")
              i.fa.fa-plus
</template>

<script>
import axios from '@/api'
import router from '@/router'
import Logger from 'js-logger'
import io from 'socket.io-client'

const userConnectedOrDisconnected = (store, connected) => {
  Logger.info('Connected: ', connected)
  store.commit('changeConnectedUsers', connected)
}

const userJoined = (store, user) => {
  Logger.info('New user joined list', user)
  store.commit('addAttendee', user)
}

const itemAdded = (store, item) => {
  Logger.info('New item added to list', item)
  store.commit('addItem', item)
}

const itemUpdated = (store, item) => {
  Logger.info('Item updated', item)
  store.commit('updateItem', item)
}

const itemRemoved = (store, itemId) => {
  Logger.info('Item remove', itemId)
  store.commit('removeItem', itemId)
}

export default {
  data: function () {
    return {
      loaded: false,
      error: false,
      newItem: {
        qty: 1,
        label: ''
      }
    }
  },
  name: 'List',
  created: function () {
    axios.get('lists/' + this.$route.params.id).then((res) => {
      Logger.debug('Loading list with ID', this.$route.params.id)
      if (res.data.attendees.some((att) => att.id === this.$store.state.currentUser.id)) {
        Logger.debug('Current user is an attendee', this.$store.state.currentUser)
        this.$store.commit('changeCurrentList', res.data)
        this.loaded = true
        Logger.debug('List loaded', this.$store.state.currentList)
        const socket = io('localhost:8081', {
          query: {
            userId: this.$store.state.currentUser.id,
            listId: this.$store.state.currentList.id
          }
        })
        socket.on('user connected', connected => userConnectedOrDisconnected(this.$store, connected))
        socket.on('user disconnected', connected => userConnectedOrDisconnected(this.$store, connected))
        socket.on('user joined', user => userJoined(this.$store, user))
        socket.on('item added', item => itemAdded(this.$store, item))
        socket.on('item updated', item => itemUpdated(this.$store, item))
        socket.on('item removed', item => itemRemoved(this.$store, item))
        Logger.info('Socket created', socket)
      } else {
        Logger.info('Current user is not an attendee, redirecting...', this.$store.state.currentUser)
        router.push('/list/' + res.data.id + '/join')
      }
    }, (err) => {
      this.error = true
      Logger.error('Error happened while loading the list', err)
    })
  },
  methods: {
    submitItem () {
      Logger.info('Submitting item', this.newItem)
      axios.post(`lists/${this.$store.state.currentList.id}/items`, {
        quantity: this.newItem.qty,
        name: this.newItem.label,
        author: this.$store.state.currentUser.id
      }).then((res) => {
        Logger.debug(res)
      })
    },
    bringItem (item) {
      Logger.info(`User ${this.$store.state.currentUser.name} brings item ${item.name}`)
      axios.patch(`lists/${this.$store.state.currentList.id}/items/${item.id}`, {
        userId: this.$store.state.currentUser.id
      }).then((res) => {
        Logger.debug(res)
      })
    },
    editItem (item) {
      Logger.info(`User ${this.$store.state.currentUser.name} edit item ${item.name}`)
    },
    removeItem (item) {
      Logger.info(`User ${this.$store.state.currentUser.name} remove item ${item.name}`)
      axios.delete(`lists/${this.$store.state.currentList.id}/items/${item.id}`, {
        params: {
          userId: this.$store.state.currentUser.id
        }
      }).then(res => {
        Logger.debug(res)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
$attendees-panel-width: 25%;
#attendees {
  width: $attendees-panel-width;
  float: right;
  .attendee {
    margin: 5px 0;
    .circle {
      height: 10px;
      width: 10px;
      border-radius: 50%;
      display: inline-block;
      margin-right: 5px;
      &.red {
        background-color: red;
      }
      &.green {
        background-color: green;
      }
    }
  }
}
#items {
  width: 100% - $attendees-panel-width;
  #qty {
    width: 80px;
  }
  #new-item {
    flex: 1;
  }
  #add-item {
    width: 80px;
  }
}
</style>
