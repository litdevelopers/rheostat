'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _SliderConstants = require('./constants/SliderConstants');

var SliderConstants = _interopRequireWildcard(_SliderConstants);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _linear = require('./algorithms/linear');

var _linear2 = _interopRequireDefault(_linear);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function getClassName(props) {
  var orientation = props.orientation === 'vertical' ? 'rheostat-vertical' : 'rheostat-horizontal';

  return ['rheostat', orientation].concat(props.className.split(' ')).join(' ');
}

var PropTypeArrOfNumber = _react.PropTypes.arrayOf(_react.PropTypes.number);
var PropTypeReactComponent = _react.PropTypes.oneOfType([_react.PropTypes.func, _react.PropTypes.string]);

exports['default'] = _react2['default'].createClass({
  displayName: 'Slider',

  propTypes: {
    // the algorithm to use
    algorithm: _react.PropTypes.shape({
      getValue: _react.PropTypes.func,
      getPosition: _react.PropTypes.func
    }),
    // any children you pass in
    children: _react.PropTypes.any,
    // standard class name you'd like to apply to the root element
    className: _react.PropTypes.string,
    // prevent the slider from moving when clicked
    disabled: _react.PropTypes.bool,
    // a custom handle you can pass in
    handle: PropTypeReactComponent,
    // the tab index to start each handler on
    handleTabIndexStart: _react.PropTypes.number,
    // the maximum possible value
    max: _react.PropTypes.number,
    // the minimum possible value
    min: _react.PropTypes.number,
    // called on click
    onClick: _react.PropTypes.func,
    // called whenever the user is done changing values on the slider
    onChange: _react.PropTypes.func,
    // called on key press
    onKeyPress: _react.PropTypes.func,
    // called when you finish dragging a handle
    onSliderDragEnd: _react.PropTypes.func,
    // called every time the slider is dragged and the value changes
    onSliderDragMove: _react.PropTypes.func,
    // called when you start dragging a handle
    onSliderDragStart: _react.PropTypes.func,
    // called whenever the user is actively changing the values on the slider
    // (dragging, clicked, keypress)
    onValuesUpdated: _react.PropTypes.func,
    // the orientation
    orientation: _react.PropTypes.oneOf(['horizontal', 'vertical']),
    // a component for rendering the pits
    pitComponent: PropTypeReactComponent,
    // the points that pits are rendered on
    pitPoints: PropTypeArrOfNumber,
    // a custom progress bar you can pass in
    progressBar: PropTypeReactComponent,
    // should we snap?
    snap: _react.PropTypes.bool,
    // the points we should snap to
    snapPoints: PropTypeArrOfNumber,
    // the values
    values: PropTypeArrOfNumber
  },

  getDefaultProps: function () {
    function getDefaultProps() {
      return {
        algorithm: _linear2['default'],
        className: '',
        disabled: false,
        handle: 'div',
        handleTabIndexStart: 1,
        max: SliderConstants.PERCENT_FULL,
        min: SliderConstants.PERCENT_EMPTY,
        orientation: 'horizontal',
        pitPoints: [],
        progressBar: 'div',
        snap: false,
        snapPoints: [],
        values: [SliderConstants.PERCENT_EMPTY]
      };
    }

    return getDefaultProps;
  }(),
  getInitialState: function () {
    function getInitialState() {
      var _this = this;

      var _props = this.props;
      var max = _props.max;
      var min = _props.min;
      var values = _props.values;


      return {
        className: getClassName(this.props),
        handlePos: values.map(function (value) {
          return _this.props.algorithm.getPosition(value, min, max);
        }),
        handleDimensions: 0,
        mousePos: null,
        sliderBox: {},
        slidingIndex: null,
        values: values
      };
    }

    return getInitialState;
  }(),
  componentWillReceiveProps: function () {
    function componentWillReceiveProps(nextProps) {
      var minMaxChanged = nextProps.min !== this.props.min || nextProps.max !== this.props.max;

      var valuesChanged = this.state.values.length !== nextProps.values.length || this.state.values.some(function (value, idx) {
        return nextProps.values[idx] !== value;
      });

      var orientationChanged = nextProps.className !== this.props.className || nextProps.orientation !== this.props.orientation;

      var willBeDisabled = nextProps.disabled && !this.props.disabled;

      if (orientationChanged) {
        this.setState({
          className: getClassName(nextProps)
        });
      }

      if (minMaxChanged || valuesChanged) this.updateNewValues(nextProps);

      if (willBeDisabled && this.state.slidingIndex !== null) {
        this.endSlide();
      }
    }

    return componentWillReceiveProps;
  }(),
  getPublicState: function () {
    function getPublicState() {
      return {
        max: this.props.max,
        min: this.props.min,
        values: this.state.values
      };
    }

    return getPublicState;
  }(),


  // istanbul ignore next
  getSliderBoundingBox: function () {
    function getSliderBoundingBox() {
      var rheostat = this.refs.rheostat;

      var node = rheostat.getDOMNode ? rheostat.getDOMNode() : rheostat;
      var rect = node.getBoundingClientRect();

      return {
        height: rect.height || node.clientHeight,
        left: rect.left,
        top: rect.top,
        width: rect.width || node.clientWidth
      };
    }

    return getSliderBoundingBox;
  }(),
  getHandleFor: function () {
    function getHandleFor(ev) {
      return Number(ev.currentTarget.getAttribute('data-handle-key'));
    }

    return getHandleFor;
  }(),
  getProgressStyle: function () {
    function getProgressStyle(idx) {
      var handlePos = this.state.handlePos;


      var value = handlePos[idx];

      if (idx === 0) {
        return this.props.orientation === 'vertical' ? { height: String(value) + '%', top: 0 } : { left: 0, width: String(value) + '%' };
      }

      var prevValue = handlePos[idx - 1];
      var diffValue = value - prevValue;

      return this.props.orientation === 'vertical' ? { height: diffValue + '%', top: String(prevValue) + '%' } : { left: String(prevValue) + '%', width: diffValue + '%' };
    }

    return getProgressStyle;
  }(),
  getMinValue: function () {
    function getMinValue(idx) {
      return this.state.values[idx - 1] ? Math.max(this.props.min, this.state.values[idx - 1]) : this.props.min;
    }

    return getMinValue;
  }(),
  getMaxValue: function () {
    function getMaxValue(idx) {
      return this.state.values[idx + 1] ? Math.min(this.props.max, this.state.values[idx + 1]) : this.props.max;
    }

    return getMaxValue;
  }(),


  // istanbul ignore next
  getHandleDimensions: function () {
    function getHandleDimensions(ev, sliderBox) {
      var handleNode = ev.currentTarget || null;

      if (!handleNode) return 0;

      return this.props.orientation === 'vertical' ? handleNode.clientHeight / sliderBox.height * SliderConstants.PERCENT_FULL / 2 : handleNode.clientWidth / sliderBox.width * SliderConstants.PERCENT_FULL / 2;
    }

    return getHandleDimensions;
  }(),
  getClosestSnapPoint: function () {
    function getClosestSnapPoint(value) {
      if (!this.props.snapPoints.length) return value;

      return this.props.snapPoints.reduce(function (snapTo, snap) {
        return Math.abs(snapTo - value) < Math.abs(snap - value) ? snapTo : snap;
      });
    }

    return getClosestSnapPoint;
  }(),
  getSnapPosition: function () {
    function getSnapPosition(positionPercent) {
      if (!this.props.snap) return positionPercent;

      var _props2 = this.props;
      var algorithm = _props2.algorithm;
      var max = _props2.max;
      var min = _props2.min;


      var value = algorithm.getValue(positionPercent, min, max);

      var snapValue = this.getClosestSnapPoint(value);

      return algorithm.getPosition(snapValue, min, max);
    }

    return getSnapPosition;
  }(),
  getNextPositionForKey: function () {
    function getNextPositionForKey(idx, keyCode) {
      var _stepMultiplier;

      var _state = this.state;
      var handlePos = _state.handlePos;
      var values = _state.values;
      var _props3 = this.props;
      var algorithm = _props3.algorithm;
      var max = _props3.max;
      var min = _props3.min;
      var snapPoints = _props3.snapPoints;


      var shouldSnap = this.props.snap;

      var proposedValue = values[idx];
      var proposedPercentage = handlePos[idx];
      var originalPercentage = proposedPercentage;
      var stepValue = 1;

      if (max >= 100) {
        proposedPercentage = Math.round(proposedPercentage);
      } else {
        stepValue = 100 / (max - min);
      }

      var currentIndex = null;

      if (shouldSnap) {
        currentIndex = snapPoints.indexOf(this.getClosestSnapPoint(values[idx]));
      }

      var stepMultiplier = (_stepMultiplier = {}, _defineProperty(_stepMultiplier, SliderConstants.KEYS.LEFT, function (v) {
        return v * -1;
      }), _defineProperty(_stepMultiplier, SliderConstants.KEYS.RIGHT, function (v) {
        return v * 1;
      }), _defineProperty(_stepMultiplier, SliderConstants.KEYS.PAGE_DOWN, function (v) {
        return v > 1 ? -v : v * -10;
      }), _defineProperty(_stepMultiplier, SliderConstants.KEYS.PAGE_UP, function (v) {
        return v > 1 ? v : v * 10;
      }), _stepMultiplier);

      if (stepMultiplier.hasOwnProperty(keyCode)) {
        proposedPercentage += stepMultiplier[keyCode](stepValue);

        if (shouldSnap) {
          if (proposedPercentage > originalPercentage) {
            // move cursor right unless overflow
            if (currentIndex < snapPoints.length - 1) {
              proposedValue = snapPoints[currentIndex + 1];
            }
            // move cursor left unless there is overflow
          } else if (currentIndex > 0) {
            proposedValue = snapPoints[currentIndex - 1];
          }
        }
      } else if (keyCode === SliderConstants.KEYS.HOME) {
        proposedPercentage = SliderConstants.PERCENT_EMPTY;

        if (shouldSnap) {
          proposedValue = snapPoints[0];
        }
      } else if (keyCode === SliderConstants.KEYS.END) {
        proposedPercentage = SliderConstants.PERCENT_FULL;

        if (shouldSnap) {
          proposedValue = snapPoints[snapPoints.length - 1];
        }
      } else {
        return null;
      }

      return shouldSnap ? algorithm.getPosition(proposedValue, min, max) : proposedPercentage;
    }

    return getNextPositionForKey;
  }(),
  getNextState: function () {
    function getNextState(idx, proposedPosition) {
      var _this2 = this;

      var handlePos = this.state.handlePos;
      var _props4 = this.props;
      var max = _props4.max;
      var min = _props4.min;


      var actualPosition = this.validatePosition(idx, proposedPosition);

      var nextHandlePos = handlePos.map(function (pos, index) {
        return index === idx ? actualPosition : pos;
      });

      return {
        handlePos: nextHandlePos,
        values: nextHandlePos.map(function (pos) {
          return _this2.props.algorithm.getValue(pos, min, max);
        })
      };
    }

    return getNextState;
  }(),
  getClosestHandle: function () {
    function getClosestHandle(positionPercent) {
      var handlePos = this.state.handlePos;


      return handlePos.reduce(function (closestIdx, node, idx) {
        var challenger = Math.abs(handlePos[idx] - positionPercent);
        var current = Math.abs(handlePos[closestIdx] - positionPercent);
        return challenger < current ? idx : closestIdx;
      }, 0);
    }

    return getClosestHandle;
  }(),


  // istanbul ignore next
  setStartSlide: function () {
    function setStartSlide(ev, x, y) {
      var sliderBox = this.getSliderBoundingBox();

      this.setState({
        handleDimensions: this.getHandleDimensions(ev, sliderBox),
        mousePos: { x: x, y: y },
        sliderBox: sliderBox,
        slidingIndex: this.getHandleFor(ev)
      });
    }

    return setStartSlide;
  }(),


  // istanbul ignore next
  startMouseSlide: function () {
    function startMouseSlide(ev) {
      this.setStartSlide(ev, ev.clientX, ev.clientY);

      if (typeof document.addEventListener === 'function') {
        document.addEventListener('mousemove', this.handleMouseSlide, false);
        document.addEventListener('mouseup', this.endSlide, false);
      } else {
        document.attachEvent('onmousemove', this.handleMouseSlide);
        document.attachEvent('onmouseup', this.endSlide);
      }

      this.killEvent(ev);
    }

    return startMouseSlide;
  }(),


  // istanbul ignore next
  startTouchSlide: function () {
    function startTouchSlide(ev) {
      if (ev.changedTouches.length > 1) return;

      var touch = ev.changedTouches[0];

      this.setStartSlide(ev, touch.clientX, touch.clientY);

      document.addEventListener('touchmove', this.handleTouchSlide, false);
      document.addEventListener('touchend', this.endSlide, false);

      if (this.props.onSliderDragStart) this.props.onSliderDragStart();

      this.killEvent(ev);
    }

    return startTouchSlide;
  }(),


  // istanbul ignore next
  handleMouseSlide: function () {
    function handleMouseSlide(ev) {
      if (this.state.slidingIndex === null) return;
      this.handleSlide(ev.clientX, ev.clientY);
      this.killEvent(ev);
    }

    return handleMouseSlide;
  }(),


  // istanbul ignore next
  handleTouchSlide: function () {
    function handleTouchSlide(ev) {
      if (this.state.slidingIndex === null) return;

      if (ev.changedTouches.length > 1) {
        this.endSlide();
        return;
      }

      var touch = ev.changedTouches[0];

      this.handleSlide(touch.clientX, touch.clientY);
      this.killEvent(ev);
    }

    return handleTouchSlide;
  }(),


  // istanbul ignore next
  handleSlide: function () {
    function handleSlide(x, y) {
      var _state2 = this.state;
      var idx = _state2.slidingIndex;
      var sliderBox = _state2.sliderBox;


      var positionPercent = this.props.orientation === 'vertical' ? (y - sliderBox.top) / sliderBox.height * SliderConstants.PERCENT_FULL : (x - sliderBox.left) / sliderBox.width * SliderConstants.PERCENT_FULL;

      this.slideTo(idx, positionPercent);

      if (this.canMove(idx, positionPercent)) {
        // update mouse positions
        this.setState({ x: x, y: y });
        if (this.props.onSliderDragMove) this.props.onSliderDragMove();
      }
    }

    return handleSlide;
  }(),


  // istanbul ignore next
  endSlide: function () {
    function endSlide() {
      var _this3 = this;

      var idx = this.state.slidingIndex;

      this.setState({ slidingIndex: -1 });

      if (typeof document.removeEventListener === 'function') {
        document.removeEventListener('mouseup', this.endSlide, false);
        document.removeEventListener('touchend', this.endSlide, false);
        document.removeEventListener('touchmove', this.handleTouchSlide, false);
        document.removeEventListener('mousemove', this.handleMouseSlide, false);
      } else {
        document.detachEvent('onmousemove', this.handleMouseSlide);
        document.detachEvent('onmouseup', this.endSlide);
      }

      if (this.props.onSliderDragEnd) this.props.onSliderDragEnd();
      if (this.props.snap) {
        var positionPercent = this.getSnapPosition(this.state.handlePos[idx]);
        this.slideTo(idx, positionPercent, function () {
          return _this3.fireChangeEvent();
        });
      } else {
        this.fireChangeEvent();
      }
    }

    return endSlide;
  }(),


  // istanbul ignore next
  handleClick: function () {
    function handleClick(ev) {
      var _this4 = this;

      // if we're coming off of the end of a slide don't handle the click also
      if (this.state.slidingIndex === -1) {
        this.setState({ slidingIndex: null });
        return;
      }

      if (ev.target.getAttribute('data-handle-key')) {
        return;
      }

      // Calculate the position of the slider on the page so we can determine
      // the position where you click in relativity.
      var sliderBox = this.getSliderBoundingBox();

      var positionDecimal = this.props.orientation === 'vertical' ? (ev.clientY - sliderBox.top) / sliderBox.height : (ev.clientX - sliderBox.left) / sliderBox.width;

      var positionPercent = positionDecimal * SliderConstants.PERCENT_FULL;

      var handleId = this.getClosestHandle(positionPercent);

      var validPositionPercent = this.getSnapPosition(positionPercent);

      // Move the handle there
      this.slideTo(handleId, validPositionPercent, function () {
        return _this4.fireChangeEvent();
      });

      if (this.props.onClick) this.props.onClick();
    }

    return handleClick;
  }(),


  // istanbul ignore next
  handleKeydown: function () {
    function handleKeydown(ev) {
      var _this5 = this;

      var idx = this.getHandleFor(ev);

      if (ev.keyCode === SliderConstants.KEYS.ESC) {
        ev.currentTarget.blur();
        return;
      }

      var proposedPercentage = this.getNextPositionForKey(idx, ev.keyCode);

      if (proposedPercentage === null) return;

      if (this.canMove(idx, proposedPercentage)) {
        this.slideTo(idx, proposedPercentage, function () {
          return _this5.fireChangeEvent();
        });
        if (this.props.onKeyPress) this.props.onKeyPress();
      }

      this.killEvent(ev);
      return;
    }

    return handleKeydown;
  }(),


  // Make sure the proposed position respects the bounds and
  // does not collide with other handles too much.
  validatePosition: function () {
    function validatePosition(idx, proposedPosition) {
      var _state3 = this.state;
      var handlePos = _state3.handlePos;
      var handleDimensions = _state3.handleDimensions;


      return Math.max(Math.min(proposedPosition, handlePos[idx + 1] !== undefined ? handlePos[idx + 1] - handleDimensions : SliderConstants.PERCENT_FULL // 100% is the highest value
      ), handlePos[idx - 1] !== undefined ? handlePos[idx - 1] + handleDimensions : SliderConstants.PERCENT_EMPTY // 0% is the lowest value
      );
    }

    return validatePosition;
  }(),
  validateValues: function () {
    function validateValues(proposedValues, props) {
      var _ref = props || this.props;

      var max = _ref.max;
      var min = _ref.min;


      return proposedValues.map(function (value, idx, values) {
        var realValue = Math.max(Math.min(value, max), min);

        if (values.length && realValue < values[idx - 1]) {
          return values[idx - 1];
        }

        return realValue;
      });
    }

    return validateValues;
  }(),


  // Can we move the slider to the given position?
  canMove: function () {
    function canMove(idx, proposedPosition) {
      var _state4 = this.state;
      var handlePos = _state4.handlePos;
      var handleDimensions = _state4.handleDimensions;


      if (proposedPosition < SliderConstants.PERCENT_EMPTY) return false;
      if (proposedPosition > SliderConstants.PERCENT_FULL) return false;

      var nextHandlePosition = handlePos[idx + 1] !== undefined ? handlePos[idx + 1] - handleDimensions : Infinity;

      if (proposedPosition > nextHandlePosition) return false;

      var prevHandlePosition = handlePos[idx - 1] !== undefined ? handlePos[idx - 1] + handleDimensions : -Infinity;

      if (proposedPosition < prevHandlePosition) return false;

      return true;
    }

    return canMove;
  }(),


  // istanbul ignore next
  fireChangeEvent: function () {
    function fireChangeEvent() {
      if (this.props.onChange) this.props.onChange(this.getPublicState());
    }

    return fireChangeEvent;
  }(),


  // istanbul ignore next
  slideTo: function () {
    function slideTo(idx, proposedPosition, onAfterSet) {
      var _this6 = this;

      var nextState = this.getNextState(idx, proposedPosition);

      this.setState(nextState, function () {
        if (_this6.props.onValuesUpdated) _this6.props.onValuesUpdated(_this6.getPublicState());
        if (onAfterSet) onAfterSet();
      });
    }

    return slideTo;
  }(),


  // istanbul ignore next
  updateNewValues: function () {
    function updateNewValues(nextProps) {
      var _this7 = this;

      // Don't update while the slider is sliding
      if (this.state.slidingIndex !== null) {
        return;
      }

      var max = nextProps.max;
      var min = nextProps.min;
      var values = nextProps.values;


      var nextValues = this.validateValues(values, nextProps);

      this.setState({
        handlePos: nextValues.map(function (value) {
          return _this7.props.algorithm.getPosition(value, min, max);
        }),
        values: nextValues
      }, function () {
        return _this7.fireChangeEvent();
      });
    }

    return updateNewValues;
  }(),
  killEvent: function () {
    function killEvent(ev) {
      ev.stopPropagation();
      ev.preventDefault();
      ev.cancelBubble = true;
      ev.returnValue = false;
    }

    return killEvent;
  }(),
  render: function () {
    function render() {
      var _this8 = this;

      var _props5 = this.props;
      var algorithm = _props5.algorithm;
      var children = _props5.children;
      var disabled = _props5.disabled;
      var Handle = _props5.handle;
      var handleTabIndexStart = _props5.handleTabIndexStart;
      var max = _props5.max;
      var min = _props5.min;
      var orientation = _props5.orientation;
      var PitComponent = _props5.pitComponent;
      var pitPoints = _props5.pitPoints;
      var ProgressBar = _props5.progressBar;


      return _react2['default'].createElement(
        'div',
        {
          className: this.state.className,
          ref: 'rheostat',
          onClick: !disabled && this.handleClick,
          style: { position: 'relative' }
        },
        _react2['default'].createElement('div', { className: 'rheostat-background' }),
        this.state.handlePos.map(function (pos, idx) {
          var handleStyle = orientation === 'vertical' ? { top: String(pos) + '%', position: 'absolute' } : { left: String(pos) + '%', position: 'absolute' };

          return _react2['default'].createElement(Handle, {
            'aria-valuemax': _this8.getMaxValue(idx),
            'aria-valuemin': _this8.getMinValue(idx),
            'aria-valuenow': _this8.state.values[idx],
            'aria-disabled': disabled,
            'data-handle-key': idx,
            className: 'rheostat-handle',
            key: idx,
            onKeyDown: !disabled && _this8.handleKeydown,
            onMouseDown: !disabled && _this8.startMouseSlide,
            onTouchStart: !disabled && _this8.startTouchSlide,
            role: 'slider',
            style: handleStyle,
            tabIndex: handleTabIndexStart + idx
          });
        }),
        this.state.handlePos.map(function (node, idx, arr) {
          if (idx === 0 && arr.length > 1) {
            return null;
          }

          return _react2['default'].createElement(ProgressBar, {
            className: 'rheostat-progress',
            key: idx,
            style: _this8.getProgressStyle(idx)
          });
        }),
        PitComponent && pitPoints.map(function (n) {
          var pos = algorithm.getPosition(n, min, max);
          var pitStyle = orientation === 'vertical' ? { top: String(pos) + '%', position: 'absolute' } : { left: String(pos) + '%', position: 'absolute' };

          return _react2['default'].createElement(
            PitComponent,
            { key: n, style: pitStyle },
            n
          );
        }),
        children
      );
    }

    return render;
  }()
});