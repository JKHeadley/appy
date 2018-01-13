<template>
  <!-- Construct the box with style you want. Here we are using box-danger -->
  <!-- Then add the class direct-chat and choose the direct-chat-* contexual class -->
  <!-- The contextual class should match the box, so we are using direct-chat-danger -->
  <div class="box box-success direct-chat direct-chat-success">
    <div class="box-header with-border">
      <h3 class="box-title">Direct Chat</h3>
      <div class="box-tools pull-right">
        <span data-toggle="tooltip" title="3 New Messages" class="badge bg-red">3</span>
        <button class="btn btn-box-tool" data-widget="collapse"><i class="fa fa-minus"></i></button>
        <!-- In box-tools add this button if you intend to use the contacts pane -->
        <button class="btn btn-box-tool" data-toggle="tooltip" title="Contacts" data-widget="chat-pane-toggle"><i class="fa fa-comments"></i></button>
        <button class="btn btn-box-tool" data-widget="remove"><i class="fa fa-times"></i></button>
      </div>
    </div>
    <!-- /.box-header -->
    <div class="box-body">
      <!-- Conversations are loaded here -->
      <div class="direct-chat-messages" id="messages">
        <!-- Message. Default to the left -->
        <div v-for="message in messages" class="direct-chat-msg" :class="chatMsg(message)">
          <div class="direct-chat-info clearfix">
            <span class="direct-chat-name" :class="chatName(message)">{{ displayName(message) }}</span>
            <span class="direct-chat-timestamp" :class="chatTimestamp(message)">{{message.createdAt | moment("D MMM h:mm a")}}</span>
          </div>
          <!-- /.direct-chat-info -->
          <img class="direct-chat-img" :src="userProfile(message)" alt="message user image">
          <!-- /.direct-chat-img -->
          <div class="direct-chat-text">
            {{message.text}}
          </div>
          <!-- /.direct-chat-text -->
        </div>
        <!-- /.direct-chat-msg -->
      </div>
      <!--/.direct-chat-messages-->

      <!-- Contacts are loaded here -->
      <div class="direct-chat-contacts">
        <ul class="contacts-list">
          <li v-for="contact in contacts" @click="getConversation(contact)">
            <a href="#" data-widget="chat-pane-toggle">
              <img class="contacts-list-img" :src="contact.profileImageUrl" alt="Contact Avatar">
              <div class="contacts-list-info">
              <span class="contacts-list-name">
                {{contact.firstName}} {{contact.lastName}}
                <small class="contacts-list-date pull-right">2/28/2015</small>
                </span>
                <span class="contacts-list-msg">How have you been? I was...</span>
              </div>
              <!-- /.contacts-list-info -->
            </a>
          </li>
          <!-- End Contact Item -->
        </ul>
        <!-- /.contatcts-list -->
      </div>
      <!-- /.direct-chat-pane -->
    </div>
    <!-- /.box-body -->
    <div class="box-footer">
      <div class="input-group">
        <input v-model="newMessageText" @keyup.enter="sendMessage" type="text" name="message" placeholder="Type Message ..." class="form-control" id="chat-input">
        <span class="input-group-btn">
          <button @click="sendMessage" type="button" class="btn btn-danger btn-flat">Send</button>
        </span>
      </div>
    </div>
    <!-- /.box-footer-->
  </div>
  <!--/.direct-chat -->
</template>

<script>
  import { wsClient, chatService } from '../../services'

  import faker from 'faker'
  import Nes from 'nes/lib/client'

  export default {
    props: [],
    data () {
      return {
        currentUser: null,
        client: null,
        conversation: null,
        messages: [],
        newMessageText: null,
        contacts: null,
        selectedContact: null
      }
    },
    computed: {
    },
    methods: {
      chatMsg (message) {
        return message.me ? 'right' : ''
      },
      chatName (message) {
        return message.me ? 'pull-right' : 'pull-left'
      },
      chatTimestamp (message) {
        return message.me ? 'pull-left' : 'pull-right'
      },
      displayName (message) {
        let user = message.me ? this.currentUser : this.selectedContact
        return user.firstName + ' ' + user.lastName
      },
      userProfile (message) {
        let user = message.me ? this.currentUser : this.selectedContact
        return user.profileImageUrl
      },
      getConversation (contact) {
        this.selectedContact = contact
        chatService.getConversation(contact._id)
          .then((conversation) => {
            this.conversation = conversation
            this.messages = conversation.messages.map((message) => {
              message.me = message.user === this.currentUser._id
              return message
            })
            this.scrollToEnd()
            return wsClient.subscribe('/conversation/' + conversation._id, this.messageRecieved)
          })
          .catch((error) => {
            console.error('ChatBox.getConversation-error:', error)
            this.$snotify.error('Get conversation failed', 'Error!')
          })
      },
      messageRecieved (message, flags) {
        if (message.user !== this.currentUser._id) {
          message.me = false
          this.messages.push(message)
        }
        this.scrollToEnd()
      },
      sendMessage () {
        wsClient.request({
          path: '/message/' + this.conversation._id,
          method: 'POST',
          payload: {
            text: this.newMessageText
          }
        })
          .catch((error) => {
            console.error('ChatBox.sendMessage-error:', error)
            this.$snotify.error('Send message failed', 'Error!')
          })
        this.messages.push({ text: this.newMessageText, createdAt: new Date(), me: true })
        this.newMessageText = null
        this.scrollToEnd()
      },
      scrollToEnd () {
        this.$nextTick(function () {
          let container = this.$el.querySelector('#messages')
          container.scrollTop = container.scrollHeight
        })
      }
    },
    created () {
      const promises = []
      promises.push(this.$userRepository.getConnections(this.$store.state.auth.user._id, { isContact: true, $select: ['connectedUser'], $embed: ['connectedUser'] }))

      Promise.all(promises)
        .then((response) => {
          this.contacts = response[0].data.docs.map((user) => { return user.connectedUser })
          this.currentUser = this.$store.state.auth.user
          this.ready = true
        })
    }
  }
</script>

<style lang="scss">
  #chat-input {
    width: 99%
  }
</style>
