import React,{Component} from 'react';
import * as Font from "expo-font";
import { Rajdhani_600SemiBold } from '@expo-google-fonts/rajdhani';
import { createSwitchNavigator, createAppContainer } from 'react-navigation';

import LoginScreen from './screens/LoginScreen';
import BottomTabNavigator from './components/BottomTabNavigator';

const AppSwitchNavigator = createSwitchNavigator({
  Login: {
    screen: LoginScreen
  },
  BottomTab: {
    screen: BottomTabNavigator
  }
});

const AppContainer = createAppContainer(AppSwitchNavigator);

export default class App extends Component {
  constructor(){
    super();
    this.state ={
      fontLoaded: false
    }
  }

  async loadFonts(){
    await Font.loadAsync({
      Rajdhani_600SemiBold: Rajdhani_600SemiBold
    });
    this.setState({fontLoaded: true});
  }

  componentDidMount(){
    this.loadFonts();
  }
  render(){
    const {fontLoaded} = this.state;
    if (fontLoaded) {
      return (<AppContainer/>);
    }
    return null;
  }
}

