<template>
  <section class="content">
    Dashboard

    <div class="callout callout-info">
      <h4>Tip!</h4>

      <p>Add the layout-top-nav class to the body tag to get this layout. This feature can also be used with a
        sidebar! So use this class if you want to remove the custom dropdown menus from the navbar and use regular
        links instead.</p>
    </div>


    <div>
      <!-- USERS LIST -->
      <div class="box box-danger">
        <div class="box-header with-border">
          <h3 class="box-title">Latest Members</h3>

          <div class="box-tools pull-right">
            <span class="label label-danger">8 New Members</span>
            <button type="button" class="btn btn-box-tool" data-widget="collapse"><i class="fa fa-minus"></i>
            </button>
            <button type="button" class="btn btn-box-tool" data-widget="remove"><i class="fa fa-times"></i>
            </button>
          </div>
        </div>
        <!-- /.box-header -->
        <div class="box-body no-padding">
          <ul class="users-list clearfix">
            <li>
              <img :src="avatar()" alt="User Image">
              <a class="users-list-name" href="#">Alexander Pierce</a>
              <span class="users-list-date">Today</span>
            </li>
            <li>
              <img :src="avatar()" alt="User Image">
              <a class="users-list-name" href="#">Norman</a>
              <span class="users-list-date">Yesterday</span>
            </li>
            <li>
              <img :src="avatar()" alt="User Image">
              <a class="users-list-name" href="#">Jane</a>
              <span class="users-list-date">12 Jan</span>
            </li>
            <li>
              <img :src="avatar()" alt="User Image">
              <a class="users-list-name" href="#">John</a>
              <span class="users-list-date">12 Jan</span>
            </li>
            <li>
              <img :src="avatar()" alt="User Image">
              <a class="users-list-name" href="#">Alexander</a>
              <span class="users-list-date">13 Jan</span>
            </li>
            <li>
              <img :src="avatar()" alt="User Image">
              <a class="users-list-name" href="#">Sarah</a>
              <span class="users-list-date">14 Jan</span>
            </li>
            <li>
              <img :src="avatar()" alt="User Image">
              <a class="users-list-name" href="#">Nora</a>
              <span class="users-list-date">15 Jan</span>
            </li>
            <li>
              <img :src="avatar()" alt="User Image">
              <a class="users-list-name" href="#">Nadia</a>
              <span class="users-list-date">15 Jan</span>
            </li>
          </ul>
          <!-- /.users-list -->
        </div>
        <!-- /.box-body -->
        <div class="box-footer text-center">
          <a href="javascript:void(0)" class="uppercase">View All Users</a>
        </div>
        <!-- /.box-footer -->
      </div>
      <!--/.box -->
    </div>



  </section>
</template>

<script>
  import faker from 'faker'
  import Nes from 'nes/lib/client'
  import ws from 'websocket'

  import ChatBox from '../../utilities/ChatBox.vue'

  export default {
    name: 'Dashboard',
    components: {
      ChatBox,
    },
    data () {
      return {
        generateRandomNumbers (numbers, max, min) {
          var a = []
          for (var i = 0; i < numbers; i++) {
            a.push(Math.floor(Math.random() * (max - min + 1)) + max)
          }
          return a
        },
        client: null
      }
    },
    computed: {
    },
    methods: {
      avatar () { return faker.image.avatar() }
    },
    mounted () {

//      var ws = new WebSocket('ws://localhost:8125');
//
//      ws.onerror = function (error) {  }
//      ws.onclose = function () {  }
//
//      ws.onopen = function () {
//        let payload = {
//          type: 'hello',
//          id: 1,
//          version: '2'
//        }
//        ws.send(JSON.stringify(payload));
//      }
//
//      ws.onmessage = function(msg) {
//        let response = JSON.parse(msg.data)
//        console.log("MESSAGE:", response)
//        if (response.type === 'hello') {
//          let payload = {
//            type: 'request',
//            id: 1,
//            method: 'GET',
//            path: 'hello'
//          }
//          ws.send(JSON.stringify(payload));
//        }
//      }
    }
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
