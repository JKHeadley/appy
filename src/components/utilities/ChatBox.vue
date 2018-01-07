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
      <div class="direct-chat-messages">
        <!-- Message. Default to the left -->
        <div v-for="message in messages" class="direct-chat-msg" :class="chatMsg(message)">
          <div class="direct-chat-info clearfix">
            <span class="direct-chat-name" :class="chatName(message)">{{ user1.displayName }}</span>
            <span class="direct-chat-timestamp" :class="chatTimestamp(message)">{{message.createdAt | moment("D MMM H:mm a")}}</span>
          </div>
          <!-- /.direct-chat-info -->
          <img class="direct-chat-img" :src="user1.avatar" alt="message user image">
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
            <a href="#">
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
        <input v-model="newMessageText" type="text" name="message" placeholder="Type Message ..." class="form-control">
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
  import { chatService } from '../../services'

  import faker from 'faker'
  import Nes from 'nes/lib/client'

  export default {
    props: [],
    data () {
      return {
        client: null,
        conversation: null,
        messages: [],
        newMessageText: null,
        contacts: null
      }
    },
    computed: {
      user1 () {
        return {
          displayName: faker.name.findName(),
          avatar: faker.image.avatar(),
          email: faker.internet.email(),
        }
      },
      user2 () {
        return {
          displayName: faker.name.findName(),
          avatar: faker.image.avatar(),
          email: faker.internet.email(),
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
      getConversation (contact) {
        console.log("CONTACT:", contact)
        chatService.getConversation(contact._id)
          .then((conversation) => {
            this.conversation = conversation
            console.log('Conversation:', conversation._id)
            this.client.subscribe('/conversation/' + conversation._id, this.messageRecieved, (err) => {
              console.log("ERROR:", err)
            })
          })
      },
      messageRecieved (message, flags) {
        console.log("MESSAGE:", message)
        if (message.user !== this.$store.state.auth.user._id) {
          message.me = false
          this.messages.push(message)
        }
      },
      connectToChat () {

        this.client.connect({ auth: { headers: { authorization: 'Bearer' + this.$store.state.auth.accessToken } } }, (err) => {
//        this.client.connect((err) => {
//        this.client.connect({ auth: this.$store.state.auth.accessToken }, (err) => {
          if (err) {
            console.log("ERROR:", err)
          }

          this.client.request('hello', (err, payload, statusCode, headers) => {   // Can also request '/h'
            console.log("CHAT:", payload)
            console.log("statusCode:", statusCode)
            console.log("headers:", headers)
          })
        })
      },
      sendMessage () {
        this.client.request({
          path: '/message/' + this.conversation._id,
          method: 'POST',
          payload: {
            text: this.newMessageText
          }
        }, (err, payload, statusCode, headers) => {
          console.log("ERR:", err)
          console.log("payload:", payload)
          console.log("statusCode:", statusCode)
        })
        this.messages.push({ text: this.newMessageText, createdAt: Date.now(), me: true })
        this.newMessageText = null
      }
    },
    created () {

      this.client = new Nes.Client('ws://localhost:8125');
      this.client.onConnect = () => {
        console.log("CONNECTED")
      }
      this.client.onDisconnect = () => {
        console.log("DISCONNECTED")
      }
      this.client.onUpdate = (incomingMessage) => {
        console.log("UPDATE")
        this.messages.push({ text: incomingMessage, createdAt: Date.now(), me: false })
      };

      this.connectToChat()

      const promises = []
      promises.push(this.$userRepository.getConnections(this.$store.state.auth.user._id, { isContact: true, $select: ['connectedUser'], $embed: ['connectedUser'] }))

      Promise.all(promises)
        .then((response) => {
          this.contacts = response[0].data.docs.map((user) => { return user.connectedUser })
          this.ready = true
        })
    }
  }
</script>
