<template>
  <section class="content dashboard">

    <!--<div class="callout callout-info">-->
      <!--<h4>Tip!</h4>-->

      <!--<p>Add the layout-top-nav class to the body tag to get this layout. This feature can also be used with a-->
        <!--sidebar! So use this class if you want to remove the custom dropdown menus from the navbar and use regular-->
        <!--links instead.</p>-->
    <!--</div>-->

    <div class="alert alert-success alert-dismissible">
      <button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>
      <h4><i class="icon fa fa-check"></i> appy is open source!</h4>
      Click on the icon to check it out on GitHub
      <a href="https://github.com/JKHeadley/appy" target="_blank"><i class="fa fa-github fa-2x"></i></a>
      and please leave a
      <a href="https://github.com/JKHeadley/appy" target="_blank"><i class="fa fa-star fa-2x"></i></a>!
    </div>

    <!-- Main row -->
    <div class="row">
      <!-- Left col -->
      <div class="col-lg-8">
        <!-- USERS LIST -->
        <box :classes="['box-danger']" :canCollapse="true" :canClose="true"
             :disableFooter="false" :headerBorder="true" :noPadding="true">
          <div slot="header">
            <h3 class="box-title">Latest Members</h3>
          </div>
          <!-- /box-header -->

          <span slot="box-tools">
          <!--<span class="label label-danger">8 New Members</span>-->
        </span>
          <!-- /box-tools -->

          <div slot="body">
            <ul class="users-list clearfix">
              <li v-for="user in newMembers">
                <img :src="user.profileImageUrl" alt="User Image">

                <router-link :to="'/members/' + user._id">
                  <a class="users-list-name" href="#">{{ getName(user) }}</a>
                </router-link>

                <span class="users-list-date">{{user.createdAt |  moment("D MMM")}}</span>
              </li>
            </ul>
            <!-- /.users-list -->
          </div>
          <!-- /box-body -->

          <div slot="footer" class="text-center">
            <router-link tag="a" class="pageLink uppercase" to="/members" v-permission.enable="['user', 'readUser']">
              View All Members
            </router-link>
          </div>
          <!-- /box-footer -->

          <div v-if="newMembersLoading" class="overlay">
            <i class="fa"><pulse-loader></pulse-loader></i>
          </div>
          <!-- /.overlay -->
        </box>
        <!-- /USERS LIST -->

        <div class="row">
          <div class="col-lg-12">
            <!-- VISITOR MAP -->
            <box :classes="['box-success']" :canCollapse="true" :canClose="true"
                 :disableFooter="true" :headerBorder="true" :noPadding="true">
              <div slot="header">
                <h3 class="box-title">Visitors Report</h3>
              </div>
              <!-- /box-header -->

              <div slot="body">

                <div class="row">
                  <div class="col-md-9 col-sm-8">
                    <div class="pad">
                      <!-- Map will be created here -->
                      <visitor-map :stats="stats" v-if="!statsLoading"></visitor-map>
                    </div>
                  </div>
                  <!--  /.col -->
                  <div class="col-md-3 col-sm-4">
                    <!-- small box -->
                    <div class="small-box bg-green visitor-box">
                      <div class="inner text-center">
                        <h3>{{stats.visitorCount}}</h3>

                        <p>Visitors</p>
                      </div>
                      <div class="icon text-center">
                        <i class="ion ion-mouse"></i>
                      </div>
                    </div>
                  </div>
                  <!--  /.col -->
                </div>
              </div>
              <!-- /box-body -->

              <div v-if="statsLoading" class="overlay">
                <i class="fa"><pulse-loader></pulse-loader></i>
              </div>
              <!-- /.overlay -->
            </box>
            <!-- /VISITOR MAP -->
          </div>
          <!-- /.col -->
        </div>
        <!-- /.row -->
      </div>
      <!-- /.col -->

      <!-- Right col -->
      <div class="col-lg-4">
        <!-- BROWSER USAGE -->
        <box :classes="['box-default']" :canCollapse="true" :canClose="true"
             :disableFooter="true" :headerBorder="true" :noPadding="true">
          <div slot="header">
            <h3 class="box-title">Browser Usage</h3>
          </div>
          <!-- /box-header -->

          <div slot="body">

            <div class="chart-responsive">
              <canvas id="pieChart" height="185px"></canvas>
            </div>
          </div>
          <!-- /box-body -->

          <div v-if="statsLoading" class="overlay">
            <i class="fa"><pulse-loader></pulse-loader></i>
          </div>
          <!-- /.overlay -->
        </box>
        <!-- /BROWSER USAGE -->

        <!-- INFO BANNERS -->
        <div>
          <div class="small-box bg-red">
            <div class="inner">
              <h3>{{stats.userCount}}</h3>

              <p>User Registrations</p>
            </div>
            <div class="icon">
              <i class="ion ion-person-add"></i>
            </div>
            <a href="#" class="small-box-footer" v-tooltip="'Coming Soon!'">
              More info <i class="fa fa-arrow-circle-right"></i>
            </a>
          </div>
          <!-- /.small box -->

          <div class="small-box bg-green">
            <div class="inner">
              <h3>{{stats.messageCount}}</h3>

              <p>Messages Sent</p>
            </div>
            <div class="icon">
              <i class="fa fa-comments-o"></i>
            </div>
            <a href="#" class="small-box-footer" v-tooltip="'Coming Soon!'">
              More info <i class="fa fa-arrow-circle-right"></i>
            </a>
          </div>
          <!-- /.small box -->

          <div class="small-box bg-aqua">
            <div class="inner">
              <h3>{{stats.imageCount}}</h3>

              <p>Images Uploaded</p>
            </div>
            <div class="icon">
              <i class="ion ion-images"></i>
            </div>
            <a href="#" class="small-box-footer" v-tooltip="'Coming Soon!'">
              More info <i class="fa fa-arrow-circle-right"></i>
            </a>
          </div>
          <!-- /.small box -->

          <div class="small-box bg-yellow">
            <div class="inner">
              <h3>{{stats.documentCount}}</h3>

              <p>Documents Created</p>
            </div>
            <div class="icon">
              <i class="ion ion-document"></i>
            </div>
            <a href="#" class="small-box-footer" v-tooltip="'Coming Soon!'">
              More info <i class="fa fa-arrow-circle-right"></i>
            </a>
          </div>
          <!-- /.small box -->
        </div>
        <!-- /INFO BANNERS -->
      </div>
      <!-- /.col -->

    </div>
    <!-- /.row -->

    <div class="row">


      <div class="col-lg-4 col-xs-6">
      </div>
      <!-- /.col -->

    </div>
    <!-- /.row -->


    <div class="row">

      <div class="col-lg-12" v-tooltip="'Coming Soon!'">
        <!-- ACTIVITY FEED -->
        <box :classes="['box-primary']" :canCollapse="true" :canClose="true"
             :disableFooter="true" :headerBorder="true" :noPadding="false">
          <div slot="header">
            <h3 class="box-title">Activity Feed</h3>
          </div>
          <!-- /box-header -->

          <span slot="box-tools">
          <span class="label label-danger">Coming Soon!</span>
        </span>
          <!-- /box-tools -->

          <div slot="body">

            <!-- The time line -->
            <ul class="timeline">
              <!-- timeline time label -->
              <li class="time-label">
                  <span class="bg-red">
                    10 Feb. 2014
                  </span>
              </li>
              <!-- /.timeline-label -->
              <!-- timeline item -->
              <li>
                <i class="fa fa-envelope bg-blue"></i>

                <div class="timeline-item">
                  <span class="time"><i class="fa fa-clock-o"></i> 12:05</span>

                  <h3 class="timeline-header"><a href="#">Support Team</a> sent you an email</h3>

                  <div class="timeline-body">
                    Etsy doostang zoodles disqus groupon greplin oooj voxy zoodles,
                    weebly ning heekya handango imeem plugg dopplr jibjab, movity
                    jajah plickers sifteo edmodo ifttt zimbra. Babblely odeo kaboodle
                    quora plaxo ideeli hulu weebly balihoo...
                  </div>
                  <div class="timeline-footer">
                    <a class="btn btn-primary btn-xs">Read more</a>
                    <a class="btn btn-danger btn-xs">Delete</a>
                  </div>
                </div>
              </li>
              <!-- END timeline item -->
              <!-- timeline item -->
              <li>
                <i class="fa fa-user bg-aqua"></i>

                <div class="timeline-item">
                  <span class="time"><i class="fa fa-clock-o"></i> 5 mins ago</span>

                  <h3 class="timeline-header no-border"><a href="#">Sarah Young</a> accepted your friend request</h3>
                </div>
              </li>
              <!-- END timeline item -->
              <!-- timeline item -->
              <li>
                <i class="fa fa-comments bg-yellow"></i>

                <div class="timeline-item">
                  <span class="time"><i class="fa fa-clock-o"></i> 27 mins ago</span>

                  <h3 class="timeline-header"><a href="#">Jay White</a> commented on your post</h3>

                  <div class="timeline-body">
                    Take me to your leader!
                    Switzerland is small and neutral!
                    We are more like Germany, ambitious and misunderstood!
                  </div>
                  <div class="timeline-footer">
                    <a class="btn btn-warning btn-flat btn-xs">View comment</a>
                  </div>
                </div>
              </li>
              <!-- END timeline item -->
              <!-- timeline time label -->
              <li class="time-label">
                  <span class="bg-green">
                    3 Jan. 2014
                  </span>
              </li>
              <!-- /.timeline-label -->
              <!-- timeline item -->
              <li>
                <i class="fa fa-camera bg-purple"></i>

                <div class="timeline-item">
                  <span class="time"><i class="fa fa-clock-o"></i> 2 days ago</span>

                  <h3 class="timeline-header"><a href="#">Mina Lee</a> uploaded new photos</h3>

                  <div class="timeline-body">
                    <img src="https://placehold.it/150x100" alt="..." class="margin">
                    <img src="https://placehold.it/150x100" alt="..." class="margin">
                    <img src="https://placehold.it/150x100" alt="..." class="margin">
                    <img src="https://placehold.it/150x100" alt="..." class="margin">
                  </div>
                </div>
              </li>
              <!-- END timeline item -->
              <!-- timeline item -->
              <li>
                <i class="fa fa-video-camera bg-maroon"></i>

                <div class="timeline-item">
                  <span class="time"><i class="fa fa-clock-o"></i> 5 days ago</span>

                  <h3 class="timeline-header"><a href="#">Mr. Doe</a> shared a video</h3>

                  <div class="timeline-body">
                    <div class="embed-responsive embed-responsive-16by9">
                      <iframe class="embed-responsive-item" src="https://www.youtube.com/embed/tMWkeBIohBs"
                              frameborder="0" allowfullscreen></iframe>
                    </div>
                  </div>
                  <div class="timeline-footer">
                    <a href="#" class="btn btn-xs bg-maroon">See comments</a>
                  </div>
                </div>
              </li>
              <!-- END timeline item -->
              <li>
                <i class="fa fa-clock-o bg-gray"></i>
              </li>
            </ul>
            <!-- /.timeline -->
          </div>
          <!-- /box-body -->

          <div slot="footer" class="text-center">
          </div>
          <!-- /box-footer -->

          <div v-if="false" class="overlay">
            <i class="fa"><pulse-loader></pulse-loader></i>
          </div>
          <!--/.overlay -->
        </box>
        <!-- /ACTIVITY FEED -->
      </div>
      <!-- /.col -->

    </div>
    <!-- /.row -->

  </section>
</template>

<script>
  import faker from 'faker'

  import VisitorMap from '../../utilities/VisitorMap.vue'

  import { statsService } from '../../../services'

  export default {
    name: 'Dashboard',
    components: {
      VisitorMap
    },
    data () {
      return {
        newMembers: {},
        client: null,
        stats: {},
        statsLoading: true
      }
    },
    computed: {
    },
    methods: {
      avatar () { return faker.image.avatar() },
      getName (user) {
        if (user._id === this.$store.state.auth.user._id) {
          return 'You'
        } else {
          return user.firstName + ' ' + user.lastName
        }
      },
      getNewMembers () {
        this.newMembersLoading = true
        this.$userRepository.list({ $sort: ['-createdAt'], $limit: 8 })
          .then(result => {
            this.newMembersLoading = false
            this.newMembers = result.data.docs
          })
          .catch((error) => {
            this.newMembersLoading = false
            console.error('Dashboard.getNewMembers-error:', error)
            this.$snotify.error('Get new members failed', 'Error!')
          })
      },
      getDashboardStats () {
        this.statsLoading = true
        statsService.getDashboardStats()
          .then(result => {
            this.stats = result
            this.createPieChart()
            this.statsLoading = false
          })
          .catch((error) => {
            this.statsLoading = false
            console.error('Dashboard.getDashboardStats-error:', error)
            this.$snotify.error('Get stats failed', 'Error!')
          })
      },
      createPieChart () {
        // -------------
        // - PIE CHART -
        // -------------
        // Get context with jQuery - using jQuery's .get() method.
        let browsers = []
        let visitors = []
        for (let browser in this.stats.totalVisitorsPerBrowser) {
          browsers.push(browser)
          visitors.push(this.stats.totalVisitorsPerBrowser[browser])
        }

        var pieChartCanvas = $('#pieChart');

        let data = {
          datasets: [{
            data: visitors,
//            backgroundColor: color
            backgroundColor: [
              '#f56954',
              '#00a65a',
              '#f39c12',
              '#00c0ef',
              '#3c8dbc',
              '#d2d6de'
            ],
          }],
          // These labels appear in the legend and in the tooltips when hovering different arcs
          labels: browsers
        }

        new Chart(pieChartCanvas, { // eslint-disable-line no-new
          type: 'doughnut',
          data: data
        });
        // -----------------
        // - END PIE CHART -
        // -----------------
      }
    },
    created () {
      this.getNewMembers()
      this.getDashboardStats()
    },
    mounted () {
//      $('.sparkbar').each(function () {
//        var $this = $(this)
//        $this.sparkline('html', {
//          type    : 'bar',
//          height  : $this.data('height') ? $this.data('height') : '30',
//          barColor: $this.data('color')
//        })
//      })
    }
  }
</script>

<style lang="scss">
  .dashboard {
    .users-list {
      & > li img {
        height: 128px;
      }
    }
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
    .pad canvas {
      border: 0px;
    }

    .chart-responsive {
      canvas {
        border: 0px;
      }
      padding-bottom: 10px;
    }

    .small-box.visitor-box {
      height: 375px;
      margin-bottom: 0px;
      .inner {
        padding-top: 100px;
      }
      .icon {
        position: static;
      }
    }
  }
</style>
