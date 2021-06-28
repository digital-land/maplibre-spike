/* global L, window, DLMaps */

// import utils from '../helpers/utils.js'
// import mapUtils from './map-utils.js'

const isFunction = function (x) {
  return Object.prototype.toString.call(x) === '[object Function]'
}

function LayerControls ($module, map, source) {
  this.$module = $module
  this.map = map
  this.tileSource = source
}

LayerControls.prototype.init = function (params) {
  this.setupOptions(params)
  // returns a node list so convert to array
  var $controls = this.$module.querySelectorAll(this.layerControlSelector)
  this.$controls = Array.prototype.slice.call($controls)

  // find parent
  this.$container = this.$module.closest('.' + this.controlsContainerClass)
  this.$container.classList.remove('js-hidden')

  //
  this.datasetNames = this.$controls.map($control => $control.dataset.layerControl)

  // create mapping between dataset and layer, one per control item
  this.availableLayers = this.createAllFeatureLayers()
  console.log(this.availableLayers)

  // listen for changes to URL
  var boundSetControls = this.setControls.bind(this)
  window.addEventListener('popstate', function (event) {
    console.log('URL has changed - back button')
    boundSetControls()
  })

  // initial set up of controls (default or urlParams)
  const urlParams = (new URL(document.location)).searchParams
  console.log("PARAMS", urlParams)
  if (!urlParams.has('layer')) {
    // if not set then use default checked controls
    console.log("NO layer params exist")
    this.updateURL()
  } else {
    // use URL params if available
    console.log("layer params exist")
    this.setControls()
  }

  // listen for changes on each checkbox and change the URL
  const boundControlChkbxChangeHandler = this.onControlChkbxChange.bind(this)
  this.$controls.forEach(function ($control) {
    console.log(this)
    $control.addEventListener('change', boundControlChkbxChangeHandler, true)
  }, this)

  return this
}

LayerControls.prototype.onControlChkbxChange = function (e) {
  console.log("I've been toggled", e.target, this)
  // get the control containing changed checkbox
  // var $clickedControl = e.target.closest(this.layerControlSelector)

  // when a control is changed update the URL params
  this.updateURL()
}

// should this return an array or a single control?
LayerControls.prototype.getControlByName = function (dataset) {
  for (let i = 0; i < this.$controls.length; i++) {
    const $control = this.$controls[i]
    if ($control.dataset.layerControl === dataset) {
      return $control
    }
  }
  return undefined
}

LayerControls.prototype.createVectorLayer = function (layerId, datasetName, _type, paintOptions) {
  this.map.addLayer({
    id: layerId,
    type: _type,
    source: this.tileSource,
    'source-layer': datasetName,
    paint: paintOptions
  })
}

LayerControls.prototype.createAllFeatureLayers = function () {
  const availableDatasets = []
  const that = this

  this.$controls.forEach(function ($control) {
    const datasetName = that.getDatasetName($control)
    const dataType = that.getDatasetType($control)
    const styleProps = that.getStyle($control)
    let layers

    if (dataType === 'point') {
      // set options for points as circle markers
      const paintOptions = {
        'circle-color': styleProps.colour,
        'circle-opacity': styleProps.opacity,
        'circle-radius': {
          base: 1.5,
          stops: [
            [6, 1],
            [22, 180]
          ]
        },
        'circle-stroke-color': styleProps.colour,
        'circle-stroke-width': styleProps.weight
      }
      // create the layer
      that.createVectorLayer(datasetName, datasetName, 'circle', paintOptions)
      layers = [datasetName]
    } else {
      // create fill layer
      that.createVectorLayer(datasetName + 'Fill', datasetName, 'fill', {
        'fill-color': styleProps.colour,
        'fill-opacity': styleProps.opacity
      })
      // create line layer
      that.createVectorLayer(datasetName + 'Line', datasetName, 'line', {
        'line-color': styleProps.colour,
        'line-width': styleProps.weight
      })
      layers = [datasetName + 'Fill', datasetName + 'Line']
    }
    availableDatasets[datasetName] = layers
  })
  return availableDatasets
}

LayerControls.prototype.enable = function ($control) {
  console.log('enable', this.getDatasetName($control))
  const $chkbx = $control.querySelector('input[type="checkbox"]')
  $chkbx.checked = true
  $control.dataset.layerControlActive = 'true'
  $control.classList.remove(this.layerControlDeactivatedClass)
  this.toggleLayerVisibility(this.map, this.getDatasetName($control), true)
}

LayerControls.prototype.disable = function ($control) {
  console.log('disable', this.getDatasetName($control))
  const $chkbx = $control.querySelector('input[type="checkbox"]')
  $chkbx.checked = false
  $control.dataset.layerControlActive = 'false'
  $control.classList.add(this.layerControlDeactivatedClass)
  this.toggleLayerVisibility(this.map, this.getDatasetName($control), false)
}

LayerControls.prototype.setControls = function () {
  const urlParams = (new URL(document.location)).searchParams

  let enabledLayerNames = []
  if (urlParams.has('layer')) {
    // get the names of the enabled and disabled layers
    // only care about layers that exist
    enabledLayerNames = urlParams.getAll('layer').filter(name => this.datasetNames.indexOf(name) > -1)
    console.log('Enable:', enabledLayerNames)
  }

  const datasetNamesClone = [].concat(this.datasetNames)
  const disabledLayerNames = datasetNamesClone.filter(name => enabledLayerNames.indexOf(name) === -1)

  // map the names to the controls
  const toEnable = enabledLayerNames.map(name => this.getControlByName(name))
  const toDisable = disabledLayerNames.map(name => this.getControlByName(name))
  console.log(toEnable, toDisable)

  // pass correct this arg
  toEnable.forEach(this.enable, this)
  toDisable.forEach(this.disable, this)
}

LayerControls.prototype.updateURL = function () {
  const urlParams = (new URL(document.location)).searchParams
  const enabledLayers = this.enabledLayers().map($control => this.getDatasetName($control))

  urlParams.delete('layer')
  enabledLayers.forEach(name => urlParams.append('layer', name))
  console.log(urlParams.toString())
  const newURL = window.location.pathname + '?' + urlParams.toString() + window.location.hash
  // add entry to history, does not fire event so need to call setControls
  window.history.pushState({}, '', newURL)
  this.setControls()
}

LayerControls.prototype.getCheckbox = function ($control) {
  return $control.querySelector('input[type="checkbox"]')
}

LayerControls.prototype.enabledLayers = function () {
  return this.$controls.filter($control => this.getCheckbox($control).checked)
}

LayerControls.prototype.disabledLayers = function () {
  return this.$controls.filter($control => !this.getCheckbox($control).checked)
}

LayerControls.prototype.getDatasetName = function ($control) {
  return $control.dataset.layerControl
}

LayerControls.prototype.getDatasetType = function ($control) {
  return $control.dataset.layerDataType
}

LayerControls.prototype.getZoomRestriction = function ($control) {
  return $control.dataset.layerControlZoom
}

LayerControls.prototype.getStyle = function ($control) {
  const defaultColour = '#003078'
  const defaultOpacity = 0.5
  const defaultWeight = 2
  const s = $control.dataset.styleOptions
  const parts = s.split(',')
  return {
    colour: parts[0] || defaultColour,
    opacity: parseFloat(parts[1]) || defaultOpacity,
    weight: parseInt(parts[2]) || defaultWeight
  }
}

LayerControls.prototype.getMarkerRadius = function ($control) {
  return parseInt($control.dataset.layerMarkerRadius)
}

LayerControls.prototype._toggleLayer = function (layerId, visibility) {
  this.map.setLayoutProperty(
    layerId,
    'visibility',
    visibility
  )
}

LayerControls.prototype.toggleLayerVisibility = function (map, datasetName, toEnable) {
  console.log('toggle layer', datasetName)
  const visibility = (toEnable) ? 'visible' : 'none'
  const layers = this.availableLayers[datasetName]
  layers.forEach(layerId => this._toggleLayer(layerId, visibility))
}

LayerControls.prototype.setupOptions = function (params) {
  params = params || {}
  this.layerControlSelector = params.layerControlSelector || '[data-layer-control]'
  this.layerControlDeactivatedClass = params.layerControlDeactivatedClass || 'deactivated-control'
  this.onEachFeature = params.onEachFeature || this.defaultOnEachFeature
  this.baseUrl = params.baseUrl || 'http://digital-land.github.io'
  this.controlsContainerClass = params.controlsContainerClass || 'dl-map__side-panel'
}
