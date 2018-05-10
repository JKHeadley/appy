<template>
      <!--<div ref="worldMap" style="width: 600px; height: 400px"></div>-->
  <div ref="worldMap" style="height: 325px;"></div>

</template>

<script>
  export default {
    name: 'VisitorMap',
    props: ['stats'],
    data () {
      return {
        loading: false
      }
    },
    computed: {
    },
    watch: {
    },
    methods: {
      collapse () {
        this.collapsed = true
        $(this.$refs.body).slideToggle(500)
        $(this.$refs.footer).slideToggle(500)
      },
      expand () {
        this.collapsed = false
        $(this.$refs.body).slideToggle(500)
        $(this.$refs.footer).slideToggle(500)
      },
      close () {
        $(this.$refs.box).slideToggle(500)
      }
    },
    mounted () {
      const visitors = this.stats.visitorData
      const totalVisitorsPerCountry = this.stats.totalVisitorsPerCountry

      const markers = visitors.map(visitor => {
        let name = visitor.country_name
        name = visitor.region_name ? visitor.region_name + ', ' + name : name
        name = visitor.city ? visitor.city + ', ' + name : name
        return {
          latLng: [visitor.latitude, visitor.longitude],
          name
        }
      })

      $(this.$refs.worldMap).vectorMap({
        map              : 'world_mill',
        normalizeFunction: 'polynomial',
        hoverOpacity     : 0.7,
        hoverColor       : false,
        backgroundColor  : 'transparent',
        regionStyle      : {
          initial      : {
            fill            : 'rgba(210, 214, 222, 1)',
            'fill-opacity'  : 1,
            stroke          : 'none',
            'stroke-width'  : 0,
            'stroke-opacity': 1
          },
          hover        : {
            'fill-opacity': 0.7,
            cursor        : 'pointer'
          },
          selected     : {
            fill: 'yellow'
          },
          selectedHover: {}
        },
        markerStyle      : {
          initial: {
            fill  : '#00a65a',
            stroke: '#111'
          }
        },
        markers,
        series: {
          regions: [{
            values: totalVisitorsPerCountry,
            scale: ['#00d16b', '#00753c'],
            normalizeFunction: 'polynomial'
          }]
        },
        onRegionTipShow: (e, el, code) => {
          el.html(el.html() + ' (Visitors - ' + (totalVisitorsPerCountry[code] || 0) + ')')
        }
      })
    },
    beforeDestroy () {
    }
  }
</script>

<style lang="scss">
</style>