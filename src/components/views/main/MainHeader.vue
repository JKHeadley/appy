<template>
  <header class="main-header">
      <span class="logo-mini">
        <a href="/"><img src="/static/img/copilot-logo-white.svg" alt="Logo" class="img-responsive center-block logo"></a>
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
          <li class="dropdown messages-menu">
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
              <span class="label label-warning">{{ unreadCount }}</span>
            </a>
            <ul class="dropdown-menu" id="dropdown-messages-menu">
              <li class="header">You have {{ unreadCount }} unread message(s) <a href="javascript:;" @click="openChatCreateBox" class="message-menu-link" style="float: right;">New Chat</a></li>
              <li v-if="conversations.length > 0">
                <!-- Inner Menu: contains the notifications -->
                <ul class="menu">
                  <li v-for="conversation in conversations" v-if="conversation.lastMessage" :class="{ 'message-unread': !conversation.hasRead }">
                    <!-- start notification -->
                    <a href="javascript:;" @click="openChatBox(conversation)">
                      <img class="message-list-img" :src="(conversation.users[0] || {}).profileImageUrl" alt="Contact Avatar">
                      <div class="message-list-info">
                        <span class="message-list-name">
                          {{(conversation.users[0] || {}).firstName}} {{(conversation.users[0] || {}).lastName}}
                          <small class="message-list-date pull-right">{{conversation.lastMessage.createdAt | moment("MMM D, h:mm a")}}</small>
                        </span>
                        <span class="message-list-msg">{{conversation.lastMessage.me ? 'You: ' : conversation.lastMessage.user.firstName + ': '}}{{conversation.lastMessage.text | shortMessage}}</span>
                        <span class="message-list-dot" v-if="conversation.hasRead">
                          <button type="button" class="btn btn-box-tool" v-tooltip="'Mark as unread'" @click.stop="markAsUnread(conversation)"><i class="fa fa-dot-circle-o"></i></button>
                        </span>
                        <span class="message-list-dot" v-else>
                          <button type="button" class="btn btn-box-tool" v-tooltip="'Mark as read'" @click.stop="markAsRead(conversation)"><i class="fa fa-circle"></i></button>
                        </span>
                      </div>
                    </a>
                  </li>
                  <!-- end notification -->
                </ul>
              </li>
              <li class="footer">
                <a href="javascript:;" class="message-menu-link" @click.stop="markAllAsRead">Mark All as Read</a>
              </li>
            </ul>
          </li>
          <!-- Notifications Menu -->

          <li class="dropdown notifications-menu">
            <a href="javascript:;" class="dropdown-toggle" data-toggle="dropdown">
              <i class="fa fa-bell-o"></i>
              <span class="label label-danger">{{ userInfo.notifications | count }}</span>
            </a>
            <ul class="dropdown-menu">
              <li class="header">You have {{ userInfo.notifications | count }} notification(s)</li>
              <li v-if="userInfo.notifications.length > 0">
                <!-- Inner Menu: contains the notifications -->
                <ul class="menu">
                  <li>
                    <!-- start notification -->
                    <a href="javascript:;">
                      <i class="fa fa-users text-aqua"></i> 5 new members joined today
                    </a>
                  </li>
                  <!-- end notification -->
                </ul>
              </li>
              <li class="footer" v-if="userInfo.notifications.length > 0">
                <a href="javascript:;">View all</a>
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
  </header>
</template>

<script>
  import { mapState } from 'vuex'
  import { authService, eventBus } from '../../../services'
  import { EVENTS } from '../../../config'

  export default {
    name: 'MainHeader',
    props: ['displayName', 'pictureUrl'],
    data () {
      return {
        ready: false,
        loading: false
      }
    },
    components: { },
    computed: {
      ...mapState({
        user: (state) => state.auth.user,
        userInfo: (state) => state.userInfo,
        conversations: (state) => state.conversations
      }),
      unreadCount () {
        return this.conversations.reduce((count, conversation) => {
          if (conversation.hasRead) {
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
      openChatCreateBox () {
        eventBus.$emit(EVENTS.OPEN_CHAT_CREATE)
      },
      openChatBox (conversation) {
        eventBus.$emit(EVENTS.OPEN_CHAT, conversation)
      },
      markAsRead (conversation) {
        eventBus.$emit(EVENTS.MARK_AS_READ, conversation)
      },
      markAsUnread (conversation) {
        eventBus.$emit(EVENTS.MARK_AS_UNREAD, conversation)
      },
      markAllAsRead () {
        for (let conversation of this.conversations) {
          if (!conversation.hasRead) {
            this.markAsRead(conversation)
          }
        }
      }
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
    width: 365px;
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
