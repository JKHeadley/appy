<template>
  <modal :adaptive="true"
         :draggable="false"
         :clickToClose="true"
         :resizable="false"
         :height="600"
         :width="600"
         @before-close="clearData"
         class="new-chat-modal"
         name="new-chat-modal">

    <div class="box box-primary new-chat-box">
      <div class="box-header with-border">
        <h3 class="box-title">Create Chat</h3>
        <div class="box-tools pull-right">
          <button class="btn btn-box-tool" @click="closeChatCreateBox"><i class="fa fa-times"></i></button>
        </div>
      </div>
      <!-- /.box-header -->
      <div class="box-body">
        <div class="chat-name-box">
          <input v-model="newConversation.name" type="text" placeholder="Name your chat" class="form-control">
        </div>
        <div class="add-people-box">
          <div class="search-box">
            <div class="search-input">
              <input v-model="searchText" @keyup="getMembers" type="text" placeholder="Search for people to add" class="form-control">
            </div>

            <div class="search-result-box">
              <ul class="result-list">
                <li v-for="user in usersToAdd" @click="toggleUser(user)">
                  <img class="search-result-img" :src="user.profileImageUrl" alt="Contact Avatar">

                  <span class="search-result-name">
                      {{user.firstName}} {{user.lastName}}
                  </span>

                  <span class="search-result-check">
                    <i v-if="user.added" class="fa fa-lg fa-check-circle-o"></i>
                    <i v-else="" class="fa fa-lg fa-circle-thin"></i>
                  </span>
                </li>
              </ul>
            </div>
          </div>
          <div class="selected-people-box">
            <div class="selected-count">
              <span class="selected">SELECTED</span><span class="count">{{addedUsers.length}}</span>
            </div>


            <ul class="selected-list">
              <li v-for="user in addedUsers" @click="removeUser(user)">
                <img class="selected-img" :src="user.profileImageUrl" alt="Contact Avatar">
                <span class="selected-name">
                        {{user.firstName}} {{user.lastName}}
                    </span>
                <span class="selected-check">
                      <i class="fa fa-lg fa-times-circle"></i>
                  </span>
              </li>
            </ul>

          </div>
        </div>
      </div>
      <!-- /.box-body -->
      <div class="box-footer">
        <div class="pull-right">
          <button class="btn btn-default" @click="closeChatCreateBox">Cancel</button>
          <button class="btn btn-primary" @click="createChat">Create</button>
        </div>
      </div>
      <!-- /.box-footer-->

      <div v-if="loading" class="overlay">
        <i class="fa"><pulse-loader></pulse-loader></i>
      </div>
    </div>

  </modal>
</template>

<script>
  import { mapState } from 'vuex'
  import { eventBus } from '../../services'
  import { EVENTS, CHAT_TYPES } from '../../config'

  export default {
    name: 'NewGroupChat',
    data () {
      return {
        ready: false,
        loading: false,
        newConversation: {},
        usersToAdd: [],
        addedUsers: [],
        searchText: null
      }
    },
    computed: {
      ...mapState({
        currentUser: (state) => state.auth.user,
      })
    },
    components: { },
    methods: {
      createChat () {
        this.loading = true
        this.newConversation.users = this.addedUsers.map((user) => { return user._id })
        this.newConversation.users.push(this.currentUser._id)
        this.newConversation.chatType = CHAT_TYPES.GROUP
        this.$conversationRepository.create(this.newConversation)
          .then(response => {
            let conversation = response.data
            this.loading = false
            this.closeChatCreateBox()
            return this.openChatBox({ conversation })
          })
          .catch(error => {
            this.loading = false
            console.error('NewGroupChat.createChat-error:', error)
            this.$snotify.error('Create chat failed', 'Error!')
          })
      },
      toggleUser (user) {
        if (user.added) {
          user.added = false
          let addedUser = this.addedUsers.find((addedUser) => {
            return addedUser._id === user._id
          })
          this.addedUsers.splice(this.addedUsers.indexOf(addedUser), 1)
        } else {
          user.added = true
          this.addedUsers.push(user)
        }
      },
      removeUser (user) {
        this.addedUsers.splice(this.addedUsers.indexOf(user), 1)
        let addedUser = this.usersToAdd.find((addedUser) => {
          return addedUser._id === user._id
        })
        if (addedUser) {
          addedUser.added = false
        }
      },
      getMembers () {
        this.loading = true
        // TODO: firescrolling
        return this.$userRepository.list({ $term: this.searchText, $select: ['firstName', 'lastName', 'profileImageUrl'], $exclude: [this.currentUser._id] })
          .then(response => {
            this.loading = false
            this.usersToAdd = response.data.docs.map((user) => {
              let addedUser = this.addedUsers.find((addedUser) => {
                return addedUser._id === user._id
              })
              if (addedUser) {
                user.added = true
              }
              return user
            })
          })
          .catch(error => {
            this.loading = false
            console.error('NewGroupChat.getMembers-error:', error)
            this.$snotify.error('Failed to get members', 'Error!')
          })
      },
      openChatCreateBox () {
        this.getMembers()
        this.$modal.show('new-chat-modal')
      },
      closeChatCreateBox () {
        this.$modal.hide('new-chat-modal')
      },
      openChatBox (conversation) {
        eventBus.$emit(EVENTS.OPEN_CHAT, conversation)
      },
      clearData () {
        this.newConversation = {}
        this.searchText = null
        this.addedUsers = []
      }
    },
    created: function () {
      eventBus.$on(EVENTS.OPEN_CHAT_CREATE, this.openChatCreateBox)
      eventBus.$on(EVENTS.CLOSE_CHAT_CREATE, this.closeChatCreateBox)
    },
    beforeDestroy () {
      eventBus.$off(EVENTS.OPEN_CHAT_CREATE, this.openChatCreateBox)
      eventBus.$off(EVENTS.CLOSE_CHAT_CREATE, this.closeChatCreateBox)
    }
  }
</script>

<style lang="scss">
  .new-chat-box {
    height: 100%;
    .box-body {
      display: flex;
      flex-direction: column;
      height: calc(100% - 95px);
      padding: 0px;
    }
    .chat-name-box {
      padding: 10px;
      border-bottom: 1px solid #dddfe2;
      input {
        border: 0;
      }
    }
    .add-people-box {
      height: 100%;
      display: flex;
      .search-box {
        width: 70%;
        border-right: 1px solid #dddfe2;
        display: flex;
        flex-direction: column;
        .search-input {
          padding: 10px;
          border-bottom: 1px solid #dddfe2;
        }
        .search-result-box {
          overflow-x: hidden;
          .result-list {
            padding: 0px;
            li {
              position: relative;
              border-bottom: 1px solid #dddfe2;
              height: 70px;
              list-style: none;
              cursor: pointer;
              &:hover {
                background-color: #f6f7f9;
              }
              .search-result-img {
                padding-top: 5px;
                border-radius: 50%;
                width: 50px;
                float: left;
              }
              .search-result-name {
                padding-top: 25px;
                font-weight: 600;
                display: block;
              }
              .search-result-check {
                padding-right: 20px;
                position: absolute;
                right: 20px;
                top: 25px;
                i {
                  color: #3c8dbc;
                }
              }
            }
          }
        }
      }
      .selected-people-box {
        overflow-x: hidden;
        position: relative;
        background-color: #f6f7f9;
        width: 30%;
        .selected-count {
          height: 45px;
          .selected {
            position: absolute;
            top: 15px;
            left: 10px;

            color: #7f7f7f;
            font-size: 11px;
            font-weight: bold;
          }
          .count {
            right: 10px;
            top: 15px;
            position: absolute;

            color: #7f7f7f;
            font-size: 11px;
            font-weight: bold;
          }
        }


        .selected-list {
          padding: 0px;
          li {
            position: relative;
            height: 40px;
            list-style: none;
            cursor: pointer;
            &:hover {
              background-color: lavender;
              .selected-check {
                display: inherit;
              }
            }
            .selected-img {
              padding-top: 0px;
              border-radius: 50%;
              width: 30px;
              float: left;
            }
            .selected-name {
              padding-top: 10px;
              font-weight: normal;
              font-size: 12px;
              display: block;
            }
            .selected-check {
              display: none;
              position: absolute;
              right: 10px;
              top: 10px;
              i {
                color: #999;
              }
            }
          }
        }
      }
    }
  }
</style>