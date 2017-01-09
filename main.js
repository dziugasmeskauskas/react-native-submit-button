import React, { Component, PropTypes } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  Easing
} from 'react-native';

import { AnimatedCircularProgress } from 'react-native-circular-progress';
import Icon from 'react-native-vector-icons/FontAwesome';

const { width, height } = Dimensions.get( 'window' );

const BUTTON_HEIGHT = 54;
const AnimatingCicleBackgroundColor = "#bbbbbb";
console.disableYellowBox = true;

class SubmitButton extends Component {

  constructor() {
    super();
    this.state = {
      isLoading            : false,
      animatedWidth        : new Animated.Value( 0 ),
      fill                 : 0,
      canShowAnimatedCircle: false,
      isReady              : false
    }
  };

  static defaultProps = {
    width            : 180,
    height           : 54,
    primaryColor     : 'rgb(30, 205, 151)',
    secondaryColor   : 'white',
    buttonText       : 'Submit',
    iconName         : 'check',
    onSubmit         : () => {
    },
    onSuccess        : () => {
    },
    onError          : () => {
    },
    buttonState      : 'normal',
    animationDuration: 200,
    errorColor       : '#ff6666'
  };

  componentWillReceiveProps( nextProps ) {
    if ( nextProps.buttonState === 'success' || nextProps.buttonState === 'error' ) {
      this.setState( { isLoading: false, isReady: true, canShowAnimatedCircle: false }, this.animateWidthBackToOriginal )
    }
  }

  render() {
    const { width, height, primaryColor, secondaryColor, buttonStyle, errorColor } = this.props;
    const buttonWidth = this.state.animatedWidth.interpolate( {
      inputRange : [ 0, 1, 2 ],
      outputRange: [ width, height, width ]
    } );
    const buttonHeight = height || BUTTON_HEIGHT;
    const readyStateBorderColor = this.props.buttonState === 'success' ? primaryColor : this.props.buttonState === 'error' ? errorColor : primaryColor;
    let borderColor = primaryColor;
    borderColor = this.state.isLoading ? AnimatingCicleBackgroundColor : readyStateBorderColor;
    borderColor = borderColor || primaryColor;
    const borderWidth = this.state.isLoading ? 4 : 4;
    const readyStateBgColor = this.props.buttonState === 'success' ? primaryColor : errorColor;
    const backgroundColor = this.state.isLoading ? 'transparent' : !this.state.isReady ? secondaryColor : readyStateBgColor;
    const buttonOpacity = this.state.canShowAnimatedCircle ? 0 : 1;
    return (
      <Animated.View style={[styles.buttonContainer, {width: buttonWidth }]}>
        <TouchableOpacity
          style={[styles.button, buttonStyle, {height: buttonHeight ,borderWidth: borderWidth, borderColor: borderColor, backgroundColor: backgroundColor, opacity: buttonOpacity}]}
          onPress={this.onPressSubmitButton}>
          {this.renderBody()}
        </TouchableOpacity>
        {this.renderAnimatedCircle()}
      </Animated.View>
    );
  }

  renderBody = () => {
    const { buttonTextWhenReady } = this.props;
    const iconName = this.props.buttonState === 'success' ? this.props.iconName : 'times';
    const textColor = this.state.isReady ? this.props.secondaryColor : this.props.primaryColor;
    const textOpacity = this.state.animatedWidth.interpolate( {
      inputRange : [ 0, 0.5, 1, 1.5, 2 ],
      outputRange: [ 1, 0, 0, 0, 1 ],
    } );
    const { textStyle } = this.props;
    if ( !this.state.isReady ) {
      return (
        <Animated.Text style={[styles.text, textStyle, {opacity: textOpacity, color: textColor}]}>{this.props.buttonText}</Animated.Text>
      );
    } else if ( buttonTextWhenReady ) {
      return (
        <Animated.Text style={[styles.text, textStyle, {opacity: textOpacity, color: textColor}]}>{buttonTextWhenReady}</Animated.Text>
      );
    }
    return (
      <Icon name={iconName} size={26} color={this.props.secondaryColor}/>
    );
  };

  renderAnimatedCircle = () => {
    const opacity = this.state.animatedWidth.interpolate( {
      inputRange : [ 0, 0.99, 1, 1.1, 2 ],
      outputRange: [ 0, 0, 1, 0, 0 ],
      extrapolate: 'clamp'
    } );
    return (
      <AnimatedCircularProgress
        ref='circularProgress'
        size={this.props.height}
        width={4}
        fill={this.state.fill}
        tintColor={this.props.primaryColor}
        backgroundColor={AnimatingCicleBackgroundColor}
        rotation={0}
        tension={20}
        style={{backgroundColor: 'transparent', position: 'absolute', top: 0, left: 0, opacity: opacity}}
      />
    );
  };

  onPressSubmitButton = () => {
    if ( this.state.isLoading || this.state.isReady ) return;
    this.props.onSubmit();
    this.setState( { isLoading: true }, () => setTimeout( () => {
      this.setState( { fill: 100, canShowAnimatedCircle: true } )
    }, this.props.animationDuration ) );
    Animated.timing( this.state.animatedWidth, {
      toValue : 1,
      duration: this.props.animationDuration,
      easing  : Easing.linear
    } ).start();
  };

  animateWidthBackToOriginal = () => {
    const cb = this.props.buttonState === 'success' ? this.props.onSuccess : this.props.onError;
    Animated.timing( this.state.animatedWidth, {
      toValue : 2,
      duration: this.props.animationDuration,
      easing  : Easing.linear
    } ).start( cb() );
  }
}

SubmitButton.propTypes = {

  primaryColor  : PropTypes.string,
  secondaryColor: PropTypes.string,

  onSubmit   : PropTypes.func, // function to be executed on button press.
  buttonState: PropTypes.oneOfType( [ 'normal', 'success', 'error' ] ),
  onSuccess  : PropTypes.func, // on success callback
  onError    : PropTypes.func, // on error callback

  width              : PropTypes.number, // button width
  height             : PropTypes.number, // button height
  buttonText         : PropTypes.string, // button text. eg: Submit
  buttonTextWhenReady: PropTypes.string, // to show when success.Either pass this or pass icon name (any name from fontawesome lib)
  iconName           : PropTypes.string, // any name from font awesome lib
  textStyle          : PropTypes.oneOfType( [ PropTypes.number, PropTypes.object ] ), // button text style
  buttonStyle        : PropTypes.oneOfType( [ PropTypes.number, PropTypes.object ] ), // button style
  animationDuration  : PropTypes.number,
  errorColor         : PropTypes.color
};

const styles = StyleSheet.create( {
  buttonContainer: {
    justifyContent: 'center'
  },
  button         : {
    height         : 54,
    borderRadius   : 35,
    alignItems     : 'center',
    justifyContent : 'center',
    backgroundColor: 'white'
  },
  text           : {
    fontSize       : 22,
    fontFamily     : 'proximanova-regular',
    color          : 'rgb(30, 205, 151)',
    fontWeight     : 'bold',
    backgroundColor: 'transparent'
  }
} );

module.exports = SubmitButton;