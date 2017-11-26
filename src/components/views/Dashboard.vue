<template>
  <section class="content">
    Dashboard
  </section>
</template>

<script>
import axios from 'axios'

export default {
  data () {
    return {
      generateRandomNumbers(numbers, max, min) {
        var a = []
        for (var i = 0; i < numbers; i++) {
          a.push(Math.floor(Math.random() * (max - min + 1)) + max)
        }
        return a
      },
      columns: ['firstName', 'lastName', 'email', 'roleName', 'edit'],
      options: {
        sortable: ['firstName', 'lastName', 'email', 'roleName'],
        requestFunction: function (request) {
          const params = {}
          params.$page = request.page
          params.$limit = request.limit
          if (request.orderBy) {
            params.$sort = request.ascending ? '-' + request.orderBy : request.orderBy
          }
          if (request.query) {
            params.$term = request.query
          }
          return this.$userRepository.list(params)
        },
        responseAdapter: function (response) {
          return { data: response.data.docs, count: response.data.items.total }
        },
        uniqueKey: '_id',
//        childRow: table
      }
    }
  },
  methods: {
    edit (row) {
      console.log("EDIT")
      this.$router.push('/user')
      return row
    },
    rowClick (data) {
      this.$refs.userTable.toggleChildRow(data.row._id)
      console.log("ROW")
    }
  }
//  mounted () {
//    this.$nextTick(() => {
//      var ctx = document.getElementById('trafficBar').getContext('2d')
//      var config = {
//        type: 'line',
//        data: {
//          labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
//          datasets: [{
//            label: 'CoPilot',
//            fill: false,
//            borderColor: '#284184',
//            pointBackgroundColor: '#284184',
//            backgroundColor: 'rgba(0, 0, 0, 0)',
//            data: this.coPilotNumbers
//          }, {
//            label: 'Personal Site',
//            borderColor: '#4BC0C0',
//            pointBackgroundColor: '#4BC0C0',
//            backgroundColor: 'rgba(0, 0, 0, 0)',
//            data: this.personalNumbers
//          }]
//        },
//        options: {
//          responsive: true,
//          maintainAspectRatio: !this.isMobile,
//          legend: {
//            position: 'bottom',
//            display: true
//          },
//          tooltips: {
//            mode: 'label',
//            xPadding: 10,
//            yPadding: 10,
//            bodySpacing: 10
//          }
//        }
//      }
//
//      new Chart(ctx, config) // eslint-disable-line no-new
//
//      var pieChartCanvas = document.getElementById('languagePie').getContext('2d')
//      var pieConfig = {
//        type: 'pie',
//        data: {
//          labels: ['HTML', 'JavaScript', 'CSS'],
//          datasets: [{
//            data: [56.6, 37.7, 4.1],
//            backgroundColor: ['#00a65a', '#f39c12', '#00c0ef'],
//            hoverBackgroundColor: ['#00a65a', '#f39c12', '#00c0ef']
//          }]
//        },
//        options: {
//          responsive: true,
//          maintainAspectRatio: !this.isMobile,
//          legend: {
//            position: 'bottom',
//            display: true
//          }
//        }
//      }
//
//      new Chart(pieChartCanvas, pieConfig) // eslint-disable-line no-new
//    })
//  }
}
</script>

<style>
.info-box {
  cursor: pointer;
}
.info-box-content {
  text-align: center;
  vertical-align: middle;
  display: inherit;
}
.fullCanvas {
  width: 100%;
}
</style>
