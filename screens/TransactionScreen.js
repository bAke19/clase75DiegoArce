import React, {Component} from "react";
import {View, Text, StyleSheet, TouchableOpacity, TextInput,ImageBackground,Image,ToastAndroid, KeyboardAvoidingView} from "react-native";
import * as Permissions from "expo-permissions";
import { BarCodeScanner } from "expo-barcode-scanner"; 
import db from "../config";

const bgImage = require("../assets/background2.png");
const appIcon = require("../assets/appIcon.png");
const appName = require("../assets/appName.png");

export default class TransactionScreen extends Component{
    constructor(props){
        super(props);
        this.state = {
            domState: "normal",
            hasCameraPermissions: null,
            scanned: false,
            bookId : '',
            studentId: '',
            bookName: '',
            studentName: '',
            numberOfBook : 0,
        }
    }

    getCameraPermission = async domState => {
        const {status} = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({
          hasCameraPermissions: status === "granted",
          domState: domState,
          scanned: false
        });
    }

    handleBarcodeScanned = async ({type,data}) => {
      const {domState} = this.state;

      if(domState == "bookId"){
        this.setState({
          bookId: data,
          domState: "normal",
          scanned: true
        });
      }else if(domState == "studentId"){
        this.setState({
          studentId: data,
          domState: "normal",
          scanned: true
        });
      }
    }

    handleTransaction = async () =>{
      const {bookId, studentId} = this.state;
      await this.getStudentDetails(studentId);
      await this.getBookDetails(bookId);

      var transactionType = await this.checkBookAvailability(bookId);

      if (!transactionType) {
        this.setState({ bookId: "", studentId: "" });
        // Solo para usuarios Android
        // ToastAndroid.show("El libro no existe en la base de datos", ToastAndroid.SHORT);
        Alert.alert("El libro no existe en la base de datos");
      } else if (transactionType === "issue") {
        var isEligible = await this.checkStudentEligibilityForBookIssue(
          studentId
        );

        if (isEligible) {
          const {studentName, bookName, numberOfBook} = this.state
          this.initiateBookIssue(bookId, studentId, bookName, studentName, numberOfBook );
        }
        // Solo para usuarios Android
        // ToastAndroid.show("Libro emitido al alumno", ToastAndroid.SHORT);
        Alert.alert("Libro emitido al alumno");
      } else {
        var isEligible = await this.checkStudentEligibilityForBookReturn(
          bookId,
          studentId
        );

        if (isEligible) {
          const {studentName, bookName, numberOfBook} = this.state
          this.initiateBookReturn(bookId, studentId, bookName, studentName, numberOfBook);
        }
        //  Solo para usuarios Android
        // ToastAndroid.show("Libro devuelto a la biblioteca", ToastAndroid.SHORT);
        Alert.alert("Libro devuelto a la biblioteca");
      }
       
    }

    initiateBookIssue = (bookId, studentId, bookName, studentName, numberOfBook) => {
      console.log("Issue");
      var time = new Date();
      db.collection("transactions").add({
        student_id: studentId,
        student_name : studentName,
        book_id: bookId,
        book_name : bookName,
        date: time,
        transaction_type: "emitir"
      });

      db.collection("books")
      .doc(bookId)
      .update({
        is_book_available: false
      });

      numberOfBook = parseInt(numberOfBook) + 1;
      db.collection("students")
      .doc(studentId)
      .update({
        number_of_books_issued : numberOfBook
      });

      this.setState({
        bookId: "",
        studentId: ""
      });
    }

    initiateBookReturn = (bookId, studentId, bookName, studentName, numberOfBook) => {
      console.log("Libro devuelto a la biblioteca");
      var time = new Date();
      db.collection("transactions").add({
        student_id: studentId,
        student_name : studentName,
        book_id: bookId,
        book_name : bookName,
        date: time,
        transaction_type: "devolver"
      });

      db.collection("books")
      .doc(bookId)
      .update({
        is_book_available: true
      });

      numberOfBook = parseInt(numberOfBook) - 1;
      db.collection("students")
      .doc(studentId)
      .update({
        number_of_books_issued : numberOfBook
      });

      this.setState({
        bookId: "",
        studentId: ""
      });
    }
 
    getBookDetails = bookId => {
      bookId = bookId.trim();
      db.collection("books")
        .where("book_id", "==", bookId)
        .get()
        .then(snapshot => {
          snapshot.docs.map(doc => {

            this.setState({
              bookName: doc.data().book_datails.book_name
            });
          });
        });
    };
  
    getStudentDetails = studentId => {
      studentId = studentId.trim();
      db.collection("students")
        .where("student_id", "==", studentId)
        .get()
        .then(snapshot => {
          snapshot.docs.map(doc => {
            this.setState({
              studentName: doc.data().student_details.student_name,
              numberOfBook : doc.data().number_of_books_issued
            });
          });
        });
    };

    checkBookAvailability = async bookId => {
      const bookRef = await db
        .collection("books")
        .where("book_id", "==", bookId)
        .get();
  
      var transactionType = "";
      if (bookRef.docs.length == 0) {
        transactionType = false;
      } else {
        bookRef.docs.map(doc => {
          //si el libro está disponible entonces el tipo de transacción será issue
          //  si no será return
          transactionType = doc.data().is_book_available ? "issue" : "return";
        });
      }
  
      return transactionType;
    };
  
    checkStudentEligibilityForBookIssue = async studentId => {
      const studentRef = await db
        .collection("students")
        .where("student_id", "==", studentId)
        .get();
  
      var isStudentEligible = "";
      if (studentRef.docs.length == 0) {
        this.setState({
          bookId: "",
          studentId: ""
        });
        isStudentEligible = false;
        Alert.alert("La id del alumno no existe en la base de dato");
      } else {
        studentRef.docs.map(doc => {
          if (doc.data().number_of_books_issued < 2) {
            isStudentEligible = true;
          } else {
            isStudentEligible = false;
            Alert.alert("El alumno ya tiene 2 libros");
            this.setState({
              bookId: "",
              studentId: ""
            });
          }
        });
      }
  
      return isStudentEligible;
    };
  
    checkStudentEligibilityForBookReturn = async (bookId, studentId) => {
      const transactionRef = await db
        .collection("transactions")
        .where("book_id", "==", bookId)
        .limit(1)
        .get();
      var isStudentEligible = "";
      transactionRef.docs.map(doc => {
        var lastBookTransaction = doc.data();
        if (lastBookTransaction.student_id === studentId) {
          isStudentEligible = true;
        } else {
          isStudentEligible = false;
          Alert.alert("El libro no fue emitido a este alumno");
          this.setState({
            bookId: "",
            studentId: ""
          });
        }
      });
      return isStudentEligible;
    };

    render(){
        const {domState, scanned, studentId, bookId, } = this.state;
        
        if(domState !== "normal"){
          return(
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarcodeScanned}
            style={StyleSheet.absoluteFill}
          />);
        }

        return(
          <KeyboardAvoidingView style={styles.container}>
            <ImageBackground
            source={bgImage}
            style={styles.bgImage}
            >
              <View style={styles.upperContainer}>
                <Image source={appIcon} style={styles.appIcon}/>
                <Image source={appName} style={styles.appName}/>
              </View>
              <View style={styles.lowerContainer}>
                <View style={styles.textInputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder={" Id del libro"}
                    placeholderTextColor={"#FFFFFF"}
                    value={bookId}
                    onChangeText={text => this.setState({ studentId: text })}
                    />
                  <TouchableOpacity 
                    style={styles.scannButtom}
                    onPress={()=>{
                      this.getCameraPermission("bookId");
                    }}>
                      <Text style={styles.text}>Escanear</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={[styles.textInputContainer, {marginTop: 25}]}>
                  <TextInput
                    style={styles.textInput}
                    placeholder={" Id del alumno"}
                    placeholderTextColor={"#FFFFFF"}
                    value={studentId}
                    onChangeText={text => this.setState({ studentId: text })}
                    />
                  <TouchableOpacity 
                    style={styles.scannButtom}
                    onPress={()=>{
                      this.getCameraPermission("studentId");
                    }}>
                      <Text style={styles.text}>Escanear</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.button}
                  onPress={this.handleTransaction}>
                  <Text style={styles.buttonText}>Enviar</Text>
                </TouchableOpacity>
              </View>          
            </ImageBackground>
          </KeyboardAvoidingView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#5653D4"
    },
    lowerContainer: {
      flex: 0.5,
      alignItems: "center",
    },
    text: {
      fontSize: 15,
      fontWeight: 'bold',
    },
    scannButtom: {
      height: 50,
      width: 100,
      justifyContent: "center",
      alignItems: "center",
      textAlign: 'center',
      borderColor: "white",
      backgroundColor: '#9DFD24',
      borderTopRightRadius:10,
      borderBottomRightRadius: 10
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
    },
    textInputContainer: {
      flexDirection:"row",
      borderWidth:2,
      borderColor:"white",
      borderRadius: 10,
      backgroundColor: '#9DFD24',
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
    button: {
      width:"43%",
      height: 55,
      justifyContent:"center",
      alignItems: "center",
      backgroundColor: "#F48D20",
      borderRadius: 15,
      marginTop: 25
    },
    buttonText: {
      fontFamily:"Rajdhani_600SemiBold",
      color: "#FFFFFF"
    }
  });