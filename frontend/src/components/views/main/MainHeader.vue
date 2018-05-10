<template>
  <header class="main-header">
      <span class="logo-mini">
        <a href="https://appyapp.io"><img src="/static/img/white_logo_icon.svg" alt="Logo" class="img-responsive center-block logo"></a>
      </span>
    <!-- Header Navbar -->
    <nav class="navbar navbar-static-top" role="navigation">
      <!-- Sidebar toggle button-->
      <a href="javascript:;" class="sidebar-toggle" data-toggle="push-menu" role="button">
        <span class="sr-only">Toggle navigation</span>
      </a>
      <!-- Navbar Right Menu -->
      <div class="navbar-custom-menu">
        <ul class="nav navbar-nav">
          <!-- Messages-->
          <li class="dropdown messages-menu"  v-tooltip="'Coming Soon!'" >
            <a href="javascript:;" class="dropdown-toggle" data-toggle="dropdown">
              <i class="fa fa-envelope-o"></i>
              <span class="label label-success">{{ userInfo.messages | count }}</span>
            </a>
            <ul class="dropdown-menu">
              <li class="header">You have {{ userInfo.messages | count }} message(s)</li>
              <li v-if="userInfo.messages.length > 0">
                <!-- inner menu: contains the messages -->
                <ul class="menu">
                  <li>
                    <!-- start message -->
                    <a href="javascript:;">
                      <!-- Message title and timestamp -->
                      <h4>
                        Support Team
                        <small>
                          <i class="fa fa-clock-o"></i> 5 mins</small>
                      </h4>
                      <!-- The message -->
                      <p>Why not consider this a test message?</p>
                    </a>
                  </li>
                  <!-- end message -->
                </ul>
                <!-- /.menu -->
              </li>
              <li class="footer" v-if="userInfo.messages.length > 0">
                <a href="javascript:;">See All Messages</a>
              </li>
            </ul>
          </li>
          <!-- /.messages-menu -->

          <!-- Chat Menu -->
          <li class="dropdown notifications-menu">
            <a href="javascript:;" class="dropdown-toggle" data-toggle="dropdown">
              <i class="fa fa-comments-o"></i>
              <span class="label label-warning">{{ unreadConversationsCount }}</span>
            </a>
            <ul class="dropdown-menu" id="dropdown-messages-menu">
              <li class="header">You have {{ unreadConversationsCount }} unread message(s)
                <span style="float: right;">
                <a href="javascript:;" @click="openNewGroupBox" class="message-menu-link">New Group</a> &middot;
                <a href="javascript:;" @click="openNewMessageBox" class="message-menu-link">New Message</a>
                </span>
              </li>
              <li v-if="conversations.length > 0">
                <!-- Inner Menu: contains the notifications -->
                <ul class="menu">
                  <li v-for="conversation in conversations" :class="{ 'message-unread': !conversation.hasRead }">
                    <!-- start notification -->
                    <a href="javascript:;" @click="openChatBox(conversation)">
                      <img class="contacts-list-img" v-if="conversation.lastMessage && conversation.chatType === CHAT_TYPES.GROUP" :src="conversation.lastMessage.user.profileImageUrl" alt="Contact Avatar">
                      <img class="contacts-list-img" v-else :src="(conversation.users[0] || {}).profileImageUrl" alt="Contact Avatar">
                      <div class="message-list-info">
                        <span class="message-list-name">
                          <span v-if="conversation.name" v-tooltip="userListTooltip(conversation.users)">{{conversation.name}}</span>
                          <span v-else>{{conversation.users | userList}}</span>
                          <span v-if="conversation.chatType === CHAT_TYPES.GROUP"><i class="fa fa-users"></i></span>
                          <small class="message-list-date pull-right" v-if="conversation.lastMessage">{{conversation.lastMessage.createdAt | moment("MMM D, h:mm a")}}</small>
                        </span>
                        <div v-if="conversation.lastMessage">
                          <span class="message-list-msg">{{conversation.lastMessage.me ? 'You: ' : conversation.lastMessage.user.firstName + ': '}}{{conversation.lastMessage.text | shortMessage}}</span>
                          <span class="message-list-dot" v-if="conversation.hasRead">
                          <button type="button" class="btn btn-box-tool" v-tooltip="'Mark as unread'" @click.stop="markConversationAsUnread(conversation)"><i class="fa fa-dot-circle-o"></i></button>
                          </span>
                            <span class="message-list-dot" v-else>
                            <button type="button" class="btn btn-box-tool" v-tooltip="'Mark as read'" @click.stop="markConversationAsRead(conversation)"><i class="fa fa-circle"></i></button>
                          </span>
                        </div>
                        <div v-else>
                          <span class="message-list-msg">This chat is empty.</span>
                        </div>
                      </div>
                    </a>
                  </li>
                  <!-- end notification -->
                </ul>
              </li>
              <li class="footer">
                <a href="javascript:;" class="message-menu-link" @click.stop="markAllConversationsAsRead">Mark All as Read</a>
              </li>
            </ul>
          </li>

          <!-- Notifications Menu -->
          <li class="dropdown notifications-menu">
            <a href="javascript:;" class="dropdown-toggle" data-toggle="dropdown">
              <i class="fa fa-bell-o"></i>
              <span class="label label-danger">{{ unreadNotificationsCount }}</span>
            </a>
            <ul class="dropdown-menu" id="dropdown-notifications-menu">
              <li class="header">You have {{ unreadNotificationsCount }} notification(s)</li>
              <li v-if="notifications.length > 0">
                <!-- Inner Menu: contains the notifications -->
                <ul class="menu">
                  <li v-for="notification in notifications" :class="{ 'message-unread': !notification.hasRead }">
                    <!-- start notification -->
                    <a href="javascript:;" @click="goToProfile(notification.actingUser)">
                      <img class="contacts-list-img" :src="notification.actingUser.profileImageUrl" alt="Contact Avatar">
                      <div class="message-list-info">
                        <span class="message-list-name">
                          <span>{{notification.actingUser.firstName}} {{notification.actingUser.lastName}}</span>
                          <small class="message-list-date pull-right">{{notification.createdAt | moment("MMM D, h:mm a")}}</small>
                        </span>
                        <div>
                          <span class="message-list-msg">{{notification.message}}</span>
                          <span class="message-list-dot" v-if="notification.hasRead">
                          <button type="button" class="btn btn-box-tool" v-tooltip="'Mark as unread'" @click.stop="markNotificationAsUnread(notification)"><i class="fa fa-dot-circle-o"></i></button>
                          </span>
                          <span class="message-list-dot" v-else>
                            <button type="button" class="btn btn-box-tool" v-tooltip="'Mark as read'" @click.stop="markNotificationAsRead(notification)"><i class="fa fa-circle"></i></button>
                          </span>
                        </div>
                      </div>
                    </a>
                  </li>
                  <!-- end notification -->
                </ul>
              </li>
              <li class="footer" v-if="notifications.length > 0">
                <!--<a href="javascript:;">View all</a>-->
                <a href="javascript:;" class="message-menu-link" @click.stop="markAllNotificationsAsRead">Mark All as Read</a>
              </li>
            </ul>
          </li>

          <!-- User Account Menu -->
          <li class="dropdown user user-menu">
            <!-- Menu Toggle Button -->
            <a href="#" class="dropdown-toggle" data-toggle="dropdown">
              <!-- The user image in the navbar-->
              <img :src="pictureUrl" class="user-image" alt="User Image">
              <!-- hidden-xs hides the username on small devices so only the image appears. -->
              <span class="hidden-xs">{{user.firstName}} {{user.lastName}}</span>
            </a>
            <ul class="dropdown-menu">
              <!-- The user image in the menu -->
              <li class="user-header">
                <img :src="pictureUrl" class="img-circle" alt="User Image">

                <p>
                  {{user.firstName}} {{user.lastName}} - {{user.roleName}}
                  <small>Member since {{user.createdAt | moment("MMMM, YYYY")}}</small>
                </p>
              </li>
              <!-- Menu Footer-->
              <li class="user-footer">
                <div class="pull-left">
                  <router-link to="/profile">
                    <a href="#" class="btn btn-default btn-flat">Profile</a>
                  </router-link>
                </div>
                <div class="pull-right">
                  <a href="#" @click="logout" class="btn btn-default btn-flat">Log out</a>
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>

    <notifications></notifications>
  </header>
</template>

<script>
  import { mapState } from 'vuex'
  import { authService, eventBus } from '../../../services'
  import { EVENTS, CHAT_TYPES } from '../../../config'
  import Notifications from '../../utilities/Notifications.vue'

  export default {
    name: 'MainHeader',
    components: {
      Notifications
    },
    props: ['displayName', 'pictureUrl'],
    data () {
      return {
        ready: false,
        loading: false,
        CHAT_TYPES: CHAT_TYPES
      }
    },
    computed: {
      ...mapState({
        user: (state) => state.auth.user,
        userInfo: (state) => state.userInfo,
        conversations: (state) => state.conversations,
        notifications: (state) => state.notifications
      }),
      unreadConversationsCount () {
        return this.conversations.reduce((count, conversation) => {
          if (conversation.hasRead) {
            return count
          } else {
            return count + 1
          }
        }, 0)
      },
      unreadNotificationsCount () {
        return this.notifications.reduce((count, notification) => {
          if (notification.hasRead) {
            return count
          } else {
            return count + 1
          }
        }, 0)
      }
    },
    methods: {
      logout () {
        this.loading = true
        authService.logout()
          .then(response => {
            this.loading = false
            this.$snotify.success('Log Out successful', 'Success!')
            this.$router.push('/login')
          })
          .catch(error => {
            this.loading = false
            console.error('MainHeader.logout-error:', error)
            this.$snotify.error('Log Out failed', 'Error!')
          })
      },
      openNewGroupBox () {
        eventBus.$emit(EVENTS.OPEN_CHAT_CREATE)
      },
      openNewMessageBox () {
        eventBus.$emit(EVENTS.OPEN_CHAT, { new: true })
      },
      openChatBox (conversation) {
        eventBus.$emit(EVENTS.OPEN_CHAT, { conversation })
      },
      markConversationAsRead (conversation) {
        eventBus.$emit(EVENTS.MARK_CONVERSATION_AS_READ, conversation)
      },
      markConversationAsUnread (conversation) {
        eventBus.$emit(EVENTS.MARK_CONVERSATION_AS_UNREAD, conversation)
      },
      markAllConversationsAsRead () {
        for (let conversation of this.conversations) {
          if (!conversation.hasRead) {
            this.markConversationAsRead(conversation)
          }
        }
      },
      markNotificationAsRead (notification) {
        eventBus.$emit(EVENTS.MARK_NOTIFICATION_AS_READ, notification)
      },
      markNotificationAsUnread (notification) {
        eventBus.$emit(EVENTS.MARK_NOTIFICATION_AS_UNREAD, notification)
      },
      markAllNotificationsAsRead () {
        for (let notification of this.notifications) {
          if (!notification.hasRead) {
            this.markNotificationAsRead(notification)
          }
        }
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
      },
      goToProfile (user) {
        this.$router.push({ name: 'MemberProfile', params: { _id: user._id }, props: user })
      },
    },
    mounted: function () {
    }
  }
</script>

<style lang="scss">
  .message-list-img {
    border-radius: 50%;
    width: 40px;
    float: left;
  }
  .message-list-info {
    margin-left: 45px;
  }
  .message-list-name {
    font-weight: 600;
    display: block;
  }
  .message-list-msg {
    color: #999;
  }
  .message-list-dot {
    float: right;
    .btn-box-tool {
      color: #97a0b3;
    }
    .btn-box-tool:hover {
      color: #333;
    }
  }
  .message-unread {
    background-color: #f2f5fd;
  }
  #dropdown-messages-menu {
    width: 450px;
    .footer {
      border-top: 1px solid #eeeeee;
    }
    li {
      a.message-menu-link {
        color: cornflowerblue;
        &:hover {
          text-decoration: underline;
          background-color: inherit;
        }
      }
    }
  }
  #dropdown-notifications-menu {
    width: 450px;
    .footer {
      border-top: 1px solid #eeeeee;
    }
    li {
      a.message-menu-link {
        color: cornflowerblue;
        &:hover {
          text-decoration: underline;
          background-color: inherit;
        }
      }
    }
  }
  .menu {
    li {
      border-bottom: 1px solid #eeeeee;
    }
  }
</style>