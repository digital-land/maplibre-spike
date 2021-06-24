/* global DLMaps, maplibregl, LayerControls, ZoomControls */

function MapController ($layerControlsList, $zoomControls) {
  this.$layerControlsList = $layerControlsList
  this.$zoomControls = $zoomControls
}

MapController.prototype.init = function (params) {
  // check maplibregl is available
  // if not return
  this.setupOptions(params)

  // create the maplibre map
  this.map = this.createMap()

  // perform setup once map is loaded
  const boundSetup = this.setup.bind(this)
  this.map.on('load', boundSetup)

  // add debugging code
  this.debug()

  return this
}

MapController.prototype.createMap = function () {
  const mappos = DLMaps.Permalink.getMapLocation(6, [0, 52])
  var map = new maplibregl.Map({
    container: this.mapId, // container id
    style: './base-tile.json', // open source tiles?
    center: mappos.center, // starting position [lng, lat]
    zoom: mappos.zoom // starting zoom
  })
  DLMaps.Permalink.setup(map)
  return map
}

MapController.prototype.setup = function () {
  // add source to map
  this.addSource()

  // add zoom controls
  this.zoomControl = new ZoomControls(this.$zoomControls, this.map, this.map.getZoom()).init({})

  // setup layers
  console.log(this.$layerControlsList, this.map)
  this.layerControlsComponent = new LayerControls(this.$layerControlsList, this.map, this.sourceName).init()

  // register click handler
  const boundClickHandler = this.clickHandler.bind(this)
  this.map.on('click', boundClickHandler)
}

MapController.prototype.addSource = function () {
  const sourceName = this.sourceName
  this.map.addSource(sourceName, {
    type: 'vector',
    tiles: [
      'https://vector-tile-spike.herokuapp.com/-/tiles/data/{z}/{x}/{y}.vector.pbf'
    ],
    minzoom: 6,
    maxzoom: 15
  })
}

MapController.prototype.clickHandler = function (e) {
  const map = this.map
  console.log('click at', e)

  var bbox = [
    [e.point.x - 5, e.point.y - 5],
    [e.point.x + 5, e.point.y + 5]
  ]

  // need to get all the layers that are clickable
  var features = map.queryRenderedFeatures(bbox, {
    layers: ['conservationarea', 'brownfieldland']
  })

  console.log(features)
  const coordinates = e.lngLat
  features.forEach(function (feature) {
    console.log(feature.properties.name, feature)
    new maplibregl.Popup()
      .setLngLat(coordinates)
      .setHTML(`<p>Name: ${feature.properties.name}</p><p><a href='https://digital-land.github.io/${feature.properties.slug}'>${feature.properties.slug}</a></p>`)
      .addTo(map)
  })
}

MapController.prototype.getMap = function () {
  return this.map
}

MapController.prototype.setupOptions = function (params) {
  params = params || {}
  this.mapId = params.mapId || 'mapid'
  this.sourceName = params.sourceName || 'dl-vectors'
}

MapController.prototype.debug = function () {
  function countFeatures (layerName) {
    const l = this.map.getLayer(layerName)
    if (l) {
      return this.map.queryRenderedFeatures({ layers: [layerName] }).length
    }
    return 0
  }
  this.map.on('moveend', function (e) {
    console.log('moveend')
    console.log('Brownfield', countFeatures('brownfieldland'))
    console.log('LA boundaries', countFeatures('ladFill'))
    console.log('conservation area', countFeatures('conservationareaFill'))
  })
}
