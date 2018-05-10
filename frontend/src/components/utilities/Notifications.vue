<template>
</template>

<script>
  import { wsClient, eventBus } from '../../services'
  import { EVENTS, NOTIFICATION_TYPES } from '../../config'

  export default {
    name: 'Notification',
    props: [],
    data () {
      return {
        ready: false,
        currentUser: null,
        notifications: [],
      }
    },
    computed: {
    },
    methods: {
      displayName (notification) {
        console.log("DISPLAY MESSAGE:", notification)
        return notification.user.firstName + ' ' + notification.user.lastName
      },
      userProfile (notification) {
        return notification.user.profileImageUrl
      },
      markNotification (notification, hasRead) {
        console.log("MARKING:", notification, hasRead)
        notification.hasRead = hasRead
        this.$store.commit('SET_NOTIFICATIONS', this.notifications)

        let promise = hasRead ? this.markAsRead(notification) : this.markAsUnread(notification)
        return promise
      },
      markAsRead (notification) {
        return this.$notificationRepository.update(notification._id, { hasRead: true })
          .catch((error) => {
            console.error('Notification.markAsRead-error:', error)
            this.$snotify.error('Mark as read failed', 'Error!')
          })
      },
      markAsUnread (notification) {
        return this.$notificationRepository.update(notification._id, { hasRead: false })
          .catch((error) => {
            console.error('Notification.markAsRead-error:', error)
            this.$snotify.error('Mark as unread failed', 'Error!')
          })
      },
      notificationRecieved (notification, flags) {
        this.formatNotification(notification)
        this.notifications.unshift(notification)
        this.$store.commit('SET_NOTIFICATIONS', this.notifications)
      },
      formatNotification (notification) {
        switch (notification.type) {
          case NOTIFICATION_TYPES.SHARED_DOCUMENT:
            notification.message = notification.actingUser.firstName + ' ' + notification.actingUser.lastName + ' has shared a document with you.'
            break
          case NOTIFICATION_TYPES.FOLLOW:
            notification.message = notification.actingUser.firstName + ' ' + notification.actingUser.lastName + ' is following you.'
            break
          case NOTIFICATION_TYPES.CONTACT:
            notification.message = notification.actingUser.firstName + ' ' + notification.actingUser.lastName + ' is now a contact.'
            break
          default:
            break
        }
      },
      formatAllNotifications () {
        for (let notification of this.notifications) {
          this.formatNotification(notification)
        }
      },
      goToProfile (user) {
        this.$router.push({ name: 'MemberProfile', params: { _id: user._id }, props: user })
      },
    },
    created () {
      this.currentUser = this.$store.state.auth.user
      const promises = []
      // Get all of the user's current notifications
      promises.push(this.$userRepository.getNotifications(this.currentUser._id, { $embed: ['actingUser'], $sort: ['-createdAt'] }))

      // Listen for any new notifications
      wsClient.subscribe('/notification/' + this.currentUser._id, this.notificationRecieved)

      Promise.all(promises)
        .then((response) => {
          this.notifications = response[0].data.docs
          this.formatAllNotifications()
          this.$store.commit('SET_NOTIFICATIONS', this.notifications)
          this.ready = true
        })
      eventBus.$on(EVENTS.MARK_NOTIFICATION_AS_READ, (notification) => { this.markNotification(notification, true) })
      eventBus.$on(EVENTS.MARK_NOTIFICATION_AS_UNREAD, (notification) => { this.markNotification(notification, false) })
    },
    beforeDestroy () {
      eventBus.$off(EVENTS.MARK_NOTIFICATION_AS_READ)
      eventBus.$off(EVENTS.MARK_NOTIFICATION_AS_UNREAD)
    }
  }
</script>

<style lang="scss">

</style>
