import {AppRegistry} from 'react-native';
import App from './src/App';

// Register the app for web
AppRegistry.registerComponent('DinnerTime', () => App);

// Run the app in the browser
AppRegistry.runApplication('DinnerTime', {
  rootTag: document.getElementById('root'),
});
