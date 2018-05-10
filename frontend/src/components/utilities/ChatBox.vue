<template>
  <modal :adaptive="true"
         :draggable="false"
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
        <h3 v-if="currentConversation && currentConversation.name" v-tooltip="userListTooltip(currentConversation.users)" class="box-title">{{currentConversation.name}}</h3>
        <h3 v-else-if="currentConversation" class="box-title">{{currentConversation.users | userList}}</h3>
        <h3 v-else class="box-title">New Message</h3>
        <span v-if="currentConversation && currentConversation.chatType === CHAT_TYPES.GROUP"><i class="fa fa-users"></i></span>
        <div class="box-tools pull-right">
          <!--<span data-toggle="tooltip" title="3 New Messages" class="badge bg-red">3</span>-->
          <!--<button class="btn btn-box-tool" data-widget="collapse"><i class="fa fa-minus"></i></button>-->
          <!--<button class="btn btn-box-tool"><i class="fa fa-user-plus"></i></button>-->
          <!-- In box-tools add this button if you intend to use the contacts pane -->
          <button class="btn btn-box-tool" v-tooltip="'Messages'" data-widget="chat-pane-toggle"><i class="fa fa-comments"></i></button>
          <button class="btn btn-box-tool" @click="closeChat"><i class="fa fa-times"></i></button>
        </div>
      </div>
      <!-- /.box-header -->
      <div class="box-body" ref="body">
        <!-- Search box for new messages -->
        <div v-if="newChat" class="new-message-search" ref="newChat">
          <vue-select ref="search" v-model="selectedMember" :options="members" :filterable="false" @search="onSearch" placeholder="To:" label="firstName" maxHeight="200px">
            <template slot="no-options">
              type to search for members
            </template>
            <template slot="option" slot-scope="user">
              <a href="javascript:;" @click.stop="getConversation({ user })">
                <img class="search-list-img" :src="user.profileImageUrl" alt="Contact Avatar">
                <div>
                  <span>
                    <span>{{user.firstName}} {{user.lastName}}</span>
                  </span>
                </div>
              </a>
            </template>
          </vue-select>
        </div>
        <!-- /.new-message-search -->
        <!-- Messages are loaded here -->
        <div class="direct-chat-messages" id="messages">
          <!-- Message. Default to the left -->
          <div v-for="message in messages" class="direct-chat-msg" :class="chatMsg(message)">
            <div class="direct-chat-info clearfix">
              <span class="direct-chat-name" :class="chatName(message)">{{ displayName(message) }}</span>
              <span class="direct-chat-timestamp" :class="chatTimestamp(message)">{{message.createdAt | moment("MMM D, h:mm a")}}</span>
            </div>
            <!-- /.direct-chat-info -->
            <a href="#"><img class="direct-chat-img" :src="userProfile(message)" alt="message user image" @click=goToProfile(message.user)></a>
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
            <li v-for="conversation in conversations" @click="getConversation({ conversation })" v-if="conversation.lastMessage">
              <a href="#" data-widget="chat-pane-toggle">
                <img class="contacts-list-img" v-if="conversation.lastMessage && conversation.chatType === CHAT_TYPES.GROUP" :src="conversation.lastMessage.user.profileImageUrl" alt="Contact Avatar">
                <img class="contacts-list-img" v-else :src="(conversation.users[0] || {}).profileImageUrl" alt="Contact Avatar">
                <div class="contacts-list-info">
                  <span class="contacts-list-name">
                    <span v-if="conversation.name" v-tooltip="userListTooltip(conversation.users)">{{conversation.name}}</span>
                    <span v-else>{{conversation.users | userList}}</span>
                    <span v-if="conversation.chatType === CHAT_TYPES.GROUP"><i class="fa fa-users"></i></span>
                    <small class="contacts-list-date pull-right">{{conversation.lastMessage.createdAt | moment("MMM D, h:mm a")}}</small>
                  </span>
                  <span class="message-list-msg">{{conversation.lastMessage.me ? 'You: ' : conversation.lastMessage.user.firstName + ': '}}{{conversation.lastMessage.text | shortMessage(30)}}</span>
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
            <button :disabled="!currentConversation || !newMessageText" @click="sendMessage" type="button" class="btn btn-success btn-flat" v-permission.enable="['postChatMessage']">Send</button>
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
  import { EVENTS, CHAT_TYPES } from '../../config'

  import _ from 'lodash'

  export default {
    name: 'ChatBox',
    props: [],
    data () {
      return {
        ready: false,
        loading: false,
        currentUser: null,
        client: null,
        currentConversation: null,
        newChat: false,
        members: [],
        selectedMember: null,
        conversations: [],
        messages: [],
        newMessageText: null,
        contacts: null,
        CHAT_TYPES: CHAT_TYPES
      }
    },
    computed: {
    },
    watch: {
      selectedMember: function (val) {
        if (val) {
          this.getConversation({ user: val })
        }
      }
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
        console.log("DISPLAY MESSAGE:", message)
        return message.user.firstName + ' ' + message.user.lastName
      },
      userProfile (message) {
        return message.user.profileImageUrl
      },
      onSearch (search, loading) {
        loading(true)
        this.search(loading, search, this)
      },
      search: _.debounce((loading, search, vm) => {
        // TODO: firescrolling
        return vm.$userRepository.list({ $term: search, $select: ['firstName', 'lastName', 'profileImageUrl'], $exclude: [vm.currentUser._id] })
          .then(response => {
            loading(false)
            vm.members = response.data.docs
          })
          .catch(error => {
            loading(false)
            console.error('ChatBox.getMembers-error:', error)
            vm.$snotify.error('Failed to get members', 'Error!')
          })
      }, 350),
      /**
       * Get a conversation either by the conversation _id or by the
       * specific users in the conversation.
       * @param params: either a conversation _id or an array of user _ids
       */
      getConversation (params) {
        this.newChat = false
        this.loading = true
        let promise = {}
        if (params.conversation) {
          promise = chatService.getConversationById(params.conversation._id)
        } else {
          promise = chatService.getConversationByUser(params.user._id)
        }
        return promise
          .then((conversation) => {
            this.selectedMember = null
            this.loading = false
            this.currentConversation = conversation
            conversation.messages = conversation.messages || []
            this.messages = conversation.messages.map((message) => {
              message.me = message.user._id === this.currentUser._id
              return message
            })
            this.scrollToEnd()
            this.markConversation(conversation, true)
          })
          .catch((error) => {
            console.error('ChatBox.getConversation-error:', error)
            this.$snotify.error('Get conversation failed', 'Error!')
          })
      },
      markConversation (conversation, hasRead) {
        console.log("CONVERSATION, HASREAD:", conversation, hasRead)
        let convo = this.conversations.find((convo) => {
          return convo._id === conversation._id
        })
        if (!convo) {
          conversation.hasRead = hasRead
          this.conversations.push(conversation)
        } else {
          convo.lastMessage = conversation.lastMessage
          convo.hasRead = hasRead
        }
        this.$store.commit('SET_CONVERSATIONS', this.conversations)

        let promise = hasRead ? chatService.markAsRead(conversation._id) : chatService.markAsUnread(conversation._id)
        return promise
          .catch((error) => {
            console.error('ChatBox.markConversation-error:', error)
            this.$snotify.error('Mark as read failed', 'Error!')
          })
      },
      // TODO: test group chats and add group chat icon next to titles
      messageRecieved (message, flags) {
        console.log("MESSAGE:", message._id)
        if (this.currentConversation && this.currentConversation.lastMessage) {
          console.log("MESSAGE:", this.currentConversation.lastMessage._id)
          console.log("MESSAGE:", this.currentConversation.lastMessage._id === message._id)
        }
        if (message.user !== this.currentUser._id) {
          message.me = false
          let convo = this.conversations.find((convo) => {
            return convo._id === message.conversation
          })
          let promise = Promise.resolve(convo)
          if (!convo) {
            promise = chatService.getConversationById(message.conversation)
          }

          promise
            .then((conversation) => {
              message.user = conversation.users.find((user) => { return user._id === message.user })
              conversation.lastMessage = message

              this.updateConversationOrder(conversation)

              if (this.currentConversation && this.currentConversation._id === conversation._id) {
                // Message belongs to the current conversation, so mark as read and add to the message list
                this.messages.push(message)
                this.markConversation(conversation, true)
              } else {
                this.markConversation(conversation, false)
              }

              this.scrollToEnd()
            })
        }
      },
      updateConversationOrder (conversation) {
        let convo = this.conversations.find((convo) => {
          return convo._id === conversation._id
        })
        if (!convo) {
          this.conversations.unshift(conversation)
        } else {
          this.conversations.splice(this.conversations.indexOf(convo), 1)
          this.conversations.unshift(convo)
        }
      },
      sendMessage () {
        if (this.newMessageText) {
          wsClient.request({
            path: '/message/' + this.currentConversation._id,
            method: 'POST',
            payload: {
              text: this.newMessageText
            }
          })
            .catch((error) => {
              console.error('ChatBox.sendMessage-error:', error.message)
              if (error.message === 'Insufficient permissions') {
                this.$snotify.warning('Not authorized: ' + error.message, 'Warning')
              } else {
                this.$snotify.error('Send message failed', 'Error!')
              }
            })
          let message = { text: this.newMessageText, createdAt: new Date(), user: this.currentUser, me: true }
          this.messages.push(message)
          let convo = this.conversations.find((convo) => {
            return convo._id === this.currentConversation._id
          })
          convo.lastMessage = message
          this.updateConversationOrder(convo)
          this.$store.commit('SET_CONVERSATIONS', this.conversations)
          this.newMessageText = null
          this.scrollToEnd()
        }
      },
      scrollToEnd () {
        this.$nextTick(function () {
          // Try catch to silence scrollHeight errors
          try {
            let container = this.$el.querySelector('#messages')
            container.scrollTop = container.scrollHeight
          } catch (error) {}
        })
      },
      openChat (params) {
        if (params.new) {
          this.newChat = true
          this.currentConversation = null
          this.messages = []
//          this.$nextTick(function () {
//            console.log("NEWCHAT")
//            this.$refs.search.$el.focus()
//            this.$refs.search.focus()
//          })
          setTimeout(() => {
            this.$refs.search.$el.firstElementChild.focus()
//            this.$refs.search.focus()
            console.log("REFS:", this.$refs)
          }, 100)
        } else {
          this.getConversation(params)
        }
        this.$modal.show('chat-modal')
      },
      closeChat () {
        this.currentConversation = null
        this.$modal.hide('chat-modal')
      },
      goToProfile (user) {
        this.$router.push({ name: 'MemberProfile', params: { _id: user._id }, props: user })
      },
      userListTooltip (users) {
        let list = ''
        for (let user of users) {
          if (list === '') {
            list = list + user.firstName + ' ' + user.lastName
          } else {
            list = list + ', ' + user.firstName + ' ' + user.lastName
          }
        }
        return list
      }
    },
    created () {
      this.currentUser = this.$store.state.auth.user
      const promises = []
      // Get all of the user's current conversations
      promises.push(chatService.getConversations())

      // Listen for any chat messages
      wsClient.subscribe('/chat/' + this.currentUser._id, this.messageRecieved)

      Promise.all(promises)
        .then((response) => {
          this.conversations = response[0].data.docs
          this.$store.commit('SET_CONVERSATIONS', this.conversations)
          this.ready = true
        })
        .catch((error) => {
          this.ready = true
          console.error('ChatBox.created-error:', error)
        })

      eventBus.$on(EVENTS.OPEN_CHAT, this.openChat)
      eventBus.$on(EVENTS.CLOSE_CHAT, this.closeChat)
      eventBus.$on(EVENTS.MARK_CONVERSATION_AS_READ, (conversation) => { this.markConversation(conversation, true) })
      eventBus.$on(EVENTS.MARK_CONVERSATION_AS_UNREAD, (conversation) => { this.markConversation(conversation, false) })
    },
    beforeDestroy () {
      eventBus.$off(EVENTS.OPEN_CHAT, this.openChat)
      eventBus.$off(EVENTS.CLOSE_CHAT, this.closeChat)
      eventBus.$off(EVENTS.MARK_CONVERSATION_AS_READ)
      eventBus.$off(EVENTS.MARK_CONVERSATION_AS_UNREAD)
    }
  }
</script>

<style lang="scss">
  #chat-input {
    height: 34px;
  }
  #messages {
    height: 271px;
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

  .new-message-search {
    .search-list-img {
      border-radius: 50%;
      width: 40px;
      float: left;
    }
    .dropdown li {
      border-bottom: 1px solid rgba(112, 128, 144, 0.1)
    }
    .dropdown li:first-child {
      border-top: 1px solid rgba(112, 128, 144, 0.1)
    }
    .dropdown li:last-child {
      border-bottom: none;
    }
    .dropdown li a {
      display: flex;
      width: 100%;
      align-items: center;
    }
    .dropdown li a .fa {
      padding-right: 0.5em;
    }
  }
</style>
