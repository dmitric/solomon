import React, { Component } from 'react';
import './App.css';
import Hammer from 'hammerjs'

import { SketchPicker } from 'react-color'
import reactCSS from 'reactcss'
import tinycolor from 'tinycolor2'

class App extends Component {
  constructor(props) {
    super(props)

    const seeded = Math.random() > 0.5
    this.state = {
      displayColorPickers: true,
      backgroundColor: seeded ? "#F8F8F8": "rgb(255,197,0)",
      centerLineColor: seeded ? "#F8E71C" : "#f5f5f5",
      cornerLineColor: seeded ? "#4A90E2" : 'rgb(42, 115, 65)',
      edgeLineColor: seeded ? "#FA2800" : 'rgb(250, 40, 0)',
      padding: 50,
      degreeSpacing: 20,
      rayLengthScale: 1,
    }
  }

  componentWillMount () {
    this.updateDimensions()
  }

  updateDimensions () {
    const w = window,
        d = document,
        documentElement = d.documentElement,
        body = d.getElementsByTagName('body')[0]
    
    const width = w.innerWidth || documentElement.clientWidth || body.clientWidth,
        height = w.innerHeight|| documentElement.clientHeight|| body.clientHeight

    //const dim = Math.min(width, height)
    const settings = { width: width, height: height }

    if (width < 500) {
      settings.height = width
      settings.padding = 0
    } else {
      settings.padding = 50
    }

    this.setState(settings)
  }

  componentWillUnmount () {
    window.removeEventListener("resize", this.updateDimensions.bind(this), true)
    window.removeEventListener('keydown', this.handleKeydown.bind(this), true)
  }

  componentDidMount () {
    window.addEventListener("resize", this.updateDimensions.bind(this), true)
    window.addEventListener('keydown', this.handleKeydown.bind(this), true)

    const mc = new Hammer(document, { preventDefault: true })

    mc.get('swipe').set({ direction: Hammer.DIRECTION_ALL })
    mc.get('pinch').set({ enable: true })

    
     mc.on("swipedown", ev => this.incrementRays())
      .on("swipeup", ev => this.decrementRays())
      .on("swipeleft", ev => this.incrementRayLength())
      .on("swiperight", ev => this.decrementRayLength())
      .on("pinchin", ev => { this.incrementRayLength(); this.incrementRays();} )
      .on("pinchout", ev => { this.decrementRayLength(); this.decrementRays();})
  }

  handleKeydown (ev) {
    if (ev.which === 67 && !(ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      this.setState({displayColorPickers: !this.state.displayColorPickers})
    } else if (ev.which === 83 && (ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      this.handleSave()
    } else if (ev.which === 82 && !(ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      this.forceUpdate()
    } else if (ev.which === 40) {
      ev.preventDefault()
      this.decrementRays()
    } else if (ev.which === 38) {
      ev.preventDefault()
      this.incrementRays()
    } else if (ev.which === 37) {
      ev.preventDefault()
      this.decrementRayLength()
    } else if (ev.which === 39) {
      ev.preventDefault()
      this.incrementRayLength()
    }
  }

  incrementRayLength () {
    this.setState({rayLengthScale: Math.max(1, this.state.rayLengthScale - 0.5) })
  }

  decrementRayLength () {
    this.setState({rayLengthScale: Math.min(20, this.state.rayLengthScale + 0.5) })
  }

  incrementRays () {
    this.setState({degreeSpacing: Math.max(5, this.state.degreeSpacing - 5)})
  }

  decrementRays () {
    this.setState({degreeSpacing: Math.min(70, this.state.degreeSpacing + 5)})
  }

  handleSave () {
    const svgData = document.getElementsByTagName('svg')[0].outerHTML   
    const link = document.createElement('a')
    
    var svgBlob = new Blob([svgData], { type:"image/svg+xml;charset=utf-8" })
    var svgURL = URL.createObjectURL(svgBlob)
    link.href = svgURL 

    link.setAttribute('download', `solomon.svg`)
    link.click()
  }

  between (min, max) {
    return Math.floor(Math.random()*(max-min+1)+min);
  }

  getActualHeight () {
    return this.state.height-2*this.state.padding
  }

  getActualWidth () {
    return this.state.width-2*this.state.padding
  }

  getCenterDegrees () {
    const actualHeight = this.getActualHeight()
    const actualWidth = this.getActualWidth()

    const degs = []
    let i = 0
    
    while (i > -360) {
      degs.push({deg: i, length: this.between(actualWidth/(6*this.state.rayLengthScale),
        (i >= -this.state.degreeSpacing && i <= 0) ||
        (i >= -360 && i <= -340) ||
        (i <= -160 && i >= -200) ? actualWidth/(2.2 * this.state.rayLengthScale) : actualHeight/(2.2 * this.state.rayLengthScale) )})
      i -= this.between(1, this.state.degreeSpacing)
    }

    return degs
  }

  getCornerDegrees () {
    const actualHeight = this.getActualHeight()
    const actualWidth = this.getActualWidth()
    
    const degs = []
    let i = 0
    
    while (i > -90) {
      degs.push({
        deg: i, length:
                    this.between(
                      Math.max(1, actualHeight/(3*this.state.rayLengthScale)),
                      Math.random() > 0.5 ? Math.max(1, actualWidth/(1.5*this.state.rayLengthScale)) : actualHeight/(2*this.state.rayLengthScale)
                    )
      })
      i -= this.between(1, this.state.degreeSpacing)
    }

    return degs
  }

  getEdgeDegrees () {
    const actualHeight = this.getActualHeight()
    //const actualWidth = this.getActualWidth()
    
    const degs = []
    let i = 0
    
    while (i > -180) {
      degs.push({
        deg: i,
        length: this.between(
                  actualHeight/(3*this.state.rayLengthScale),
                  actualHeight/(1.5*this.state.rayLengthScale)
                )
      })
      i -= this.between(1, this.state.degreeSpacing*1.5)
    }

    return degs
  }

  render() {

    const actualHeight = this.getActualHeight()
    const actualWidth = this.getActualWidth()

    return (
      <div className="App">
       { this.state.displayColorPickers ? <div className="color-pickers">
          <ColorPicker color={tinycolor(this.state.backgroundColor).toRgb()} disableAlpha={true}
            handleChange={ (color) => this.setState({backgroundColor: color.hex}) } />
          <ColorPicker color={tinycolor(this.state.centerLineColor).toRgb()} disableAlpha={true}
            handleChange={ (color) => this.setState({centerLineColor: color.hex}) } />
          <ColorPicker color={tinycolor(this.state.cornerLineColor).toRgb()} disableAlpha={true}
            handleChange={ (color) => this.setState({cornerLineColor: color.hex}) } />
          <ColorPicker color={tinycolor(this.state.edgeLineColor).toRgb()} disableAlpha={true}
            handleChange={ (color) => this.setState({edgeLineColor: color.hex}) } />
            </div> : null
        }

        <div style={{ padding: this.state.padding }}> 
          <svg width={actualWidth} height={actualHeight}>
            <rect width={"100%"} height={"100%"} fill={this.state.backgroundColor} />
            
            <g className='center'>
            {
              this.getCenterDegrees().map((centerDeg, ii) => {
              return <line key={ii} x1={actualWidth/2}
                    y1={actualHeight/2}
                    x2={actualWidth/2 + centerDeg.length}
                    y2={actualHeight/2}
                    transform={`rotate(${centerDeg.deg}, ${actualWidth/2}, ${actualHeight/2})`}
                    strokeWidth={1} stroke={this.state.centerLineColor} />
              })
            }
              
            </g>

            <g className='corners'>
              <g className='top-left'>
                {
                  this.getCornerDegrees().map((centerDeg, ii) => {
                    return <line key={ii} x1={0}
                          y1={0}
                          x2={0}
                          y2={centerDeg.length}
                          transform={`rotate(${centerDeg.deg}, ${0}, ${0})`}
                          strokeWidth={1} stroke={this.state.cornerLineColor} />
                  })
                }
              </g>

              <g className='bottom-left'>
                {
                  this.getCornerDegrees().map((centerDeg, ii) => {
                    return <line key={ii}
                          x1={0}
                          y1={actualHeight}
                          x2={centerDeg.length}
                          y2={actualHeight}
                          transform={`rotate(${centerDeg.deg}, ${0}, ${actualHeight})`}
                          strokeWidth={1} stroke={this.state.cornerLineColor} />
                  })
                }
              </g>

               <g className='top-right'>
                {
                  this.getCornerDegrees().map((centerDeg, ii) => {
                    return <line key={ii}
                          x1={actualWidth}
                          y1={0}
                          x2={actualWidth - centerDeg.length}
                          y2={0}
                          transform={`rotate(${centerDeg.deg}, ${actualWidth}, ${0})`}
                          strokeWidth={1} stroke={this.state.cornerLineColor} />
                  })
                }
              </g>

              <g className='bottom-right'>
                {
                  this.getCornerDegrees().map((centerDeg, ii) => {
                    return <line key={ii}
                          x1={actualWidth}
                          y1={actualHeight}
                          x2={actualWidth}
                          y2={actualHeight - centerDeg.length}
                          transform={`rotate(${centerDeg.deg}, ${actualWidth}, ${actualHeight})`}
                          strokeWidth={1} stroke={this.state.cornerLineColor} />
                  })
                }
              </g>
            </g>

            <g className='edges'>
              <g className='top'>
                {
                  this.getEdgeDegrees().map((deg, ii) => {
                    return <line key={ii}
                              x1={actualWidth/2}
                              y1={0}
                              x2={actualWidth/2 - deg.length}
                              y2={0} 
                              transform={`rotate(${deg.deg}, ${actualWidth/2}, ${0})`} 
                              strokeWidth={1}
                              stroke={this.state.edgeLineColor}/>
                  })
                }
              </g>
              <g className='bottom'>
                {
                  this.getEdgeDegrees().map((deg, ii) => {
                    return <line key={ii}
                              x1={actualWidth/2}
                              y1={actualHeight}
                              x2={actualWidth/2 + deg.length}
                              y2={actualHeight} 
                              transform={`rotate(${deg.deg}, ${actualWidth/2}, ${actualHeight})`} 
                              strokeWidth={1}
                              stroke={this.state.edgeLineColor}/>
                  })
                }
              </g>

              <g className='left'>
                {
                  this.getEdgeDegrees().map((deg, ii) => {
                    return <line key={ii}
                              x1={0}
                              y1={actualHeight/2}
                              x2={0}
                              y2={actualHeight/2 + deg.length} 
                              transform={`rotate(${deg.deg}, ${0}, ${actualHeight/2})`} 
                              strokeWidth={1}
                              stroke={this.state.edgeLineColor}/>
                  })
                }
              </g>
              <g className='right'>
                {
                  this.getEdgeDegrees().map((deg, ii) => {
                    return <line key={ii}
                              x1={actualWidth}
                              y1={actualHeight/2}
                              x2={actualWidth}
                              y2={actualHeight/2 - deg.length} 
                              transform={`rotate(${deg.deg}, ${actualWidth}, ${actualHeight/2})`} 
                              strokeWidth={1}
                              stroke={this.state.edgeLineColor}/>
                  })
                }
              </g>
            </g>
          </svg>
        </div>
      </div>
    );
  }
}

class ColorPicker extends React.Component {

  constructor (props) {
    super(props)

    this.state = {
      color: props.color,
      displayColorPicker: props.displayColorPicker,
      disableAlpha: props.disableAlpha
    }
  }

  handleClick = () => {
    this.setState({ displayColorPicker: !this.state.displayColorPicker })
  };

  handleClose = () => {
    this.setState({ displayColorPicker: false })
    if (this.props.handleClose) {
      this.props.handleClose()
    }
  };

  handleChange = (color) => {
    this.setState({ color: color.rgb })
    this.props.handleChange(color)
  };

  render () {

    const styles = reactCSS({
      'default': {
        color: {
          background: this.state.disableAlpha ?
                `rgb(${ this.state.color.r }, ${ this.state.color.g }, ${ this.state.color.b })` :
                `rgba(${ this.state.color.r }, ${ this.state.color.g }, ${ this.state.color.b },  ${ this.state.color.a })`,
        },
        popover: {
          position: 'absolute',
          zIndex: '10',
        },
        cover: {
          position: 'fixed',
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px',
        },
      },
    })

    return (
      <div className='color-picker'>
        <div className='swatch' onClick={ this.handleClick }>
          <div className='color' style={ styles.color } />
        </div>
        { this.state.displayColorPicker ? <div style={ styles.popover }>
          <div style={ styles.cover } onClick={ this.handleClose }/>
          <SketchPicker color={ this.state.color } onChange={ this.handleChange } disableAlpha={this.state.disableAlpha} />
        </div> : null }
      </div>
    )
  }
}

export default App;
