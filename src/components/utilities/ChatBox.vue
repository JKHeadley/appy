<template>
  <modal :adaptive="true"
         :draggable="true"
         :clickToClose="false"
         :height="370"
         :width="400"
         class="chat-modal"
         name="chat-modal">
    <!-- Construct the box with style you want. Here we are using box-danger -->
    <!-- Then add the class direct-chat and choose the direct-chat-* contexual class -->
    <!-- The contextual class should match the box, so we are using direct-chat-danger -->
    <div v-if="ready" class="box box-success direct-chat direct-chat-success">
      <div class="box-header with-border">
        <h3 v-if="currentConversation" class="box-title">{{currentConversation.users[0].firstName}} {{currentConversation.users[0].lastName}}</h3>
        <h3 v-else class="box-title">Direct Chat</h3>
        <div class="box-tools pull-right">
          <span data-toggle="tooltip" title="3 New Messages" class="badge bg-red">3</span>
          <button class="btn btn-box-tool" data-widget="collapse"><i class="fa fa-minus"></i></button>
          <!-- In box-tools add this button if you intend to use the contacts pane -->
          <button class="btn btn-box-tool" data-toggle="tooltip" title="Contacts" data-widget="chat-pane-toggle"><i class="fa fa-comments"></i></button>
          <button class="btn btn-box-tool" @click="closeChat"><i class="fa fa-times"></i></button>
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
            <li v-for="conversation in conversations" @click="getConversation(conversation)">
              <a href="#" data-widget="chat-pane-toggle">
                <img class="contacts-list-img" :src="(conversation.users[0] || {}).profileImageUrl" alt="Contact Avatar">
                <div class="contacts-list-info">
                <span class="contacts-list-name">
                  {{(conversation.users[0] || {}).firstName}} {{(conversation.users[0] || {}).lastName}}
                  <small class="contacts-list-date pull-right">{{conversation.lastMessage.createdAt | moment("D MMM h:mm a")}}</small>
                  </span>
                  <span class="contacts-list-msg">{{conversation.lastMessage.text | shortMessage}}</span>
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
      <div class="box-footer chat-footer">
        <div class="input-group">
          <input v-model="newMessageText" @keyup.enter="sendMessage" type="text" name="message" placeholder="Type Message ..." class="form-control" id="chat-input">
          <span class="input-group-btn">
            <button :disabled="!currentConversation" @click="sendMessage" type="button" class="btn btn-danger btn-flat">Send</button>
          </span>
        </div>
      </div>
      <!-- /.box-footer-->

      <div v-if="loading" class="overlay">
        <i class="fa"><pulse-loader></pulse-loader></i>
      </div>
    </div>
    <!--/.direct-chat -->
  </modal>
</template>

<script>
  import { wsClient, chatService, eventBus } from '../../services'
  import { EVENTS } from '../../config'

  export default {
    props: [],
    data () {
      return {
        ready: false,
        loading: false,
        currentUser: null,
        client: null,
        currentConversation: null,
        conversations: [],
        messages: [],
        newMessageText: null,
        contacts: null
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
        return message.user.firstName + ' ' + message.user.lastName
      },
      userProfile (message) {
        return message.user.profileImageUrl
      },
      /**
       * Get a conversation either by the conversation _id or by the
       * specific users in the conversation.
       * @param params: either a conversation _id or an array of user _ids
       */
      getConversation (params) {
        this.loading = true
        let promise = {}
        if (params._id) {
          promise = chatService.getConversationById(params._id)
        } else {
          promise = chatService.getConversationByContacts(params)
        }
        return promise
          .then((conversation) => {
            this.loading = false
            this.currentConversation = conversation
            conversation.messages = conversation.messages || []
            this.messages = conversation.messages.map((message) => {
              message.me = message.user._id === this.currentUser._id
              return message
            })
            this.scrollToEnd()
          })
          .catch((error) => {
            console.error('ChatBox.getConversation-error:', error)
            this.$snotify.error('Get conversation failed', 'Error!')
          })
      },
      messageRecieved (message, flags) {
        if (message.user !== this.currentUser._id) {
          message.me = false
          message.user = message.conversation.users.find((user) => { return user._id === message.user })
          let convo = this.conversations.find((convo) => {
            return convo._id === message.conversation._id
          })
          // EXPL: Add new conversations
          if (!convo) {
            message.conversation.users = message.conversation.users.filter((user) => {
              return user._id !== this.currentUser._id
            })
            convo = message.conversation
            this.conversations.push(convo);
          }
          convo.lastMessage = message
          this.messages.push(message)
          this.scrollToEnd()
        }
      },
      sendMessage () {
        wsClient.request({
          path: '/message/' + this.currentConversation._id,
          method: 'POST',
          payload: {
            text: this.newMessageText
          }
        })
          .catch((error) => {
            console.error('ChatBox.sendMessage-error:', error)
            this.$snotify.error('Send message failed', 'Error!')
          })
        let message = { text: this.newMessageText, createdAt: new Date(), user: this.currentUser, me: true }
        this.messages.push(message)
        let convo = this.conversations.find((convo) => {
          return convo._id === this.currentConversation._id
        })
        convo.lastMessage = message
        this.newMessageText = null
        this.scrollToEnd()
      },
      scrollToEnd () {
        this.$nextTick(function () {
          // EXPL: Try catch to silence scrollHeight errors
          try {
            let container = this.$el.querySelector('#messages')
            container.scrollTop = container.scrollHeight
          } catch (error) {}
        })
      },
      openChat (contacts) {
        if (contacts) {
          this.getConversation(contacts)
        }
        this.$modal.show('chat-modal')
      },
      closeChat () {
        this.$modal.hide('chat-modal')
      }
    },
    created () {
      this.currentUser = this.$store.state.auth.user
      const promises = []
      // EXPL: Get all of the user's current conversations
      promises.push(chatService.getConversations())

      // EXPL: Listen for any chat messages
      wsClient.subscribe('/chat/' + this.currentUser._id, this.messageRecieved)

      Promise.all(promises)
        .then((response) => {
          this.conversations = response[0].data.docs.map((conversation) => {
            conversation.lastMessage = conversation.lastMessage || {}
            return conversation
          })
          this.ready = true
        })
      eventBus.$on(EVENTS.OPEN_CHAT, this.openChat)
      eventBus.$on(EVENTS.CLOSE_CHAT, this.closeChat)
    },
    beforeDestroy () {
      eventBus.$off(EVENTS.OPEN_CHAT, this.openChat)
      eventBus.$off(EVENTS.CLOSE_CHAT, this.closeChat)
    }
  }
</script>

<style lang="scss">
  #chat-input {
    width: 99%
  }
  .direct-chat {
    height: 100%;
  }
  .box-footer.chat-footer {
    position: absolute;
    bottom: 0;
  }
  .v--modal-overlay.chat-modal {
    width: 0;
    height: 0;
  }
</style>
