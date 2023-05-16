import React, {Component} from "react";
import { View,
         Text,
         TextInput, 
         TouchableOpacity, 
         ImageBackground,
         Image,
         Alert, 
         KeyboardAvoidingView,
         StyleSheet 
        } from "react-native";
import firebase from "firebase";

const firebaseConfig = {
    apiKey: "AIzaSyB1hCyEefPP5mEy51s25kkzGgwF_yQyKec",
    authDomain: "e-library-e8c9c.firebaseapp.com",
    projectId: "e-library-e8c9c",
    storageBucket: "e-library-e8c9c.appspot.com",
    messagingSenderId: "242154945059",
    appId: "1:242154945059:web:b8f44454f00de07abf4f96"
  };

  if(!firebase.apps.length){
    firebase.initializeApp(firebaseConfig);
  }else{
    firebase.app();
  }

const bgImage = require("../assets/background2.png");
const appIcon = require("../assets/appIcon.png");
const appName = require("../assets/appName.png");

export default class LoginScreen extends Component{

    constructor(){
        super();
        this.state={
            email: "",
            password: ""
        }
    }

    handleLogin = (email, password) => {
        firebase
          .auth()
          .signInWithEmailAndPassword(email, password)
          .then(() => {
            this.props.navigation.navigate("BottomTab");
          })
          .catch(error => {
            Alert.alert(error.message);
          });
      };
    

    render(){
        const {email, password} = this.state;
        return(
            <KeyboardAvoidingView style={styles.container}>
                <ImageBackground source={bgImage} style={styles.bgImage}>
                    <View style={styles.upperContainer}>
                        <Image source={appIcon} style={styles.appIcon}/>
                        <Image source={appName} style={styles.appName}/>
                    </View>
                    <View style={styles.lowerContainer}>
                        <TextInput 
                            style={styles.textInput} 
                            onChange={text => this.setState({email: text})}
                            placeholder="Ingresa tu correo electronico"
                            placeholderTextColor={"#FFFFFF"}
                            autoFocus
                        />
                        <TextInput 
                            style={styles.textInput} 
                            onChange={text => this.setState({password: text})}
                            placeholder="Ingresa tu contraseña"
                            placeholderTextColor={"#FFFFFF"}
                            secureTextEntry
                        />
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => this.handleLogin(email, password)}> 
                            <Text style={styles.buttonText}>
                                Ingresar
                            </Text>

                        </TouchableOpacity>
                    </View>
                </ImageBackground>
            </KeyboardAvoidingView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex:1,
        backgroundColor: "#ffffff"
    },
    bgImage: {
        flex: 1,
        resizeMode: "cover",
        justifyContent: "center"
    },
    upperContainer:{
        flex:0.5,
        justifyContent: "center",
        alignItems: "center"
    },
    appIcon:{
        width: 200,
        height:200,
        resizeMode:"contain",
        marginTop: 80
    },
    appName:{
        width: 80,
        height: 80,
        resizeMode: "contain"
    },
    lowerContainer: {
      flex: 0.5,
      alignItems: "center"
    },
    textInput: {
        borderWidth: 3,
        borderColor: "white",
        borderRadius: 10,
        padding: 10,
        width: "57%",
        height: 50,
        color: "white",
        backgroundColor: "#5653D4",
        fontFamily:"Rajdhani_600SemiBold",
        fontSize: 18,
        margin: 20
      },
    button: {
      width: "43%",
      height: 55,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#F48D20",
      borderRadius: 15
    },
    buttonText: {
      fontSize: 24,
      color: "#FFFFFF",
      fontFamily: "Rajdhani_600SemiBold"
    }
})