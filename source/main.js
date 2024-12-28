//------imports--&--Configs----------//
 import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
 import {getDatabase, ref, set, get, child, update, remove } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

  const firebaseConfig = {
    apiKey: "AIzaSyAh71dSV9oPVGsPbjDpnqbBcXidu2sLfH4",
    authDomain: "qwerty-5db7c.firebaseapp.com",
    projectId: "qwerty-5db7c",
    storageBucket: "qwerty-5db7c.firebasestorage.app",
    messagingSenderId: "527853816006",
    appId: "1:527853816006:web:01740e573c506777936fc7",
    measurementId: "G-NSS563GY2H"
  };


 window.onload = function(){
    const app = initializeApp(firebaseConfig);
    const db = getDatabase();
    const dbref = ref(db);

  document.getElementById('swithToReg').onclick=switchToReg;
  document.getElementById('swithToLogin').onclick=switchTologin;
  document.getElementById('login-btn').onclick = loginValidation;
  document.getElementById('register-btn').onclick = registerValidation;


//------switch to reg-----//
function switchToReg(){
  document.getElementById('register-portal').style = "display:inline-block";
  document.getElementById('login-portal').style = "display:none";
}
function switchTologin(){
  document.getElementById('register-portal').style = "display: none ";
  document.getElementById('login-portal').style = "display:inline-block";
}


//---acc no and pin pattern-----//
var accNoPat = "^[0-9]{6}$";
var accPinPat = "^[0-9]{4}$";
//----login validation------//
function loginValidation(){
  var lAccNo = document.getElementById('lAccNo').value;
  var lAccPin = document.getElementById('lAccPin').value;
  if(lAccNo.match(accNoPat) && lAccPin.match(accPinPat)){
    portal(lAccNo,lAccPin);
  }else{
      alert("Please enter valid details");
  }
}



//-----Register validation----------//
function registerValidation(){
var rAccName = document.getElementById('rAccName').value;
var rAccNo = document.getElementById('rAccNo').value;
var rAccPin = document.getElementById('rAccPin').value;
var rConAccPin = document.getElementById('rConAccPin').value;
if(rAccName!==null && rAccNo.match(accNoPat) && rAccPin.match(accPinPat) && rAccPin == rConAccPin){

   set(ref(db,"accNo "+rAccNo+"/accPin "+rAccPin+"/accDetails"),{
     name: rAccName,
     avalBal: 0
   }).then(()=>{
     alert("Registered");
   }).catch((error)=>{
     alert("Registered Failed\n"+error);
   });

   set(ref(db,"accNo "+rAccNo+"/received"),{
     receivedAmt: 0
   }).then(()=>{
     console.log("received amt updated");
   }).catch((error)=>{
     alert("received amt updation Failed\n"+error);
   });
}else{
  alert("Please enter a valid details");
}
}


//----------------------------Portal----------------------------//
function portal(accNo,accPin){
  document.getElementById('login-portal').style = "display:none";
  document.getElementById('register-portal').style = "display:none";
  document.getElementById('online-payment').style= "display:none";
  document.getElementById('portal').style = "display:inline-block";


  var name,avalBal,totalBal,receivedAmt,msg;

  //-----------getting data from firebase------------//
get(child(dbref,"accNo "+accNo+"/accPin "+accPin+"/accDetails")).then((snapshot)=>{
  if(snapshot.exists()){
     name = snapshot.val().name;
     avalBal = snapshot.val().avalBal;
     document.getElementById('userName').innerHTML = 'Hi '+name;
  }else{
    alert("no data found in the database");
    window.location.reload();
  }
}).catch((error)=>{
  alert("error while getting  data\n"+error);
});

get(child(dbref,"accNo "+accNo+"/received")).then((snapshot)=>{
  if(snapshot.exists()){
      receivedAmt = snapshot.val().receivedAmt;
      totalBal = avalBal + receivedAmt;
      alert("Inseting card");
      msg="welcome, "+name;
      updateAvalBal(msg,totalBal);
      updateReceivedAmt();
  }else{
    alert("no received amount found in the database");
  }
}).catch((error)=>{
  alert("error while getting  data\n"+error);
});


//----------update values in firebase----------------//
function updateAvalBal(msg,totalBal){
   update(ref(db,"accNo "+accNo+"/accPin "+accPin+"/accDetails"),{
     avalBal: totalBal
   }).then(()=>{
     alert(msg);
     document.getElementById('totalBal').innerHTML = "TotalBal: "+totalBal;
   }).catch((error)=>{
     alert("error\n"+error);
   });
 }
   function updateReceivedAmt(){
      update(ref(db,"accNo "+accNo+"/received"),{
        receivedAmt: 0
      }).then(()=>{
        console.log("recived amount updated");
      }).catch((error)=>{
        alert("error\n"+error);
      });
}


//-------------deposit--------------------///
document.getElementById('depoist-btn').addEventListener('click',depoist);

function depoist(){
  document.getElementById('depoist-portal').style= "display:inline-block";
  document.getElementById('withdraw-portal').style= "display:none";
  document.getElementById('transfer-portal').style= "display:none";
  document.getElementById('online-payment').style= "display:none";

  document.getElementById('dep-submit').addEventListener('click',function(){
    document.getElementById('depoist-btn').removeEventListener('click',depoist);
    var depoistAmt = Number(document.getElementById('depoist-amt').value);
    if (depoistAmt >= 100) {
      // Check if the deposit amount is in multiples of 100
      if (depoistAmt % 100 === 0) {
        totalBal += depoistAmt;
        document.getElementById('depoist-amt').value = '';
        msg = "Rs. " + depoistAmt + " was successfully deposited";
        updateAvalBal(msg, totalBal);
      } else {
        alert('Amount must be in multiples of Rs. 100');
      }
    } else {
      alert('Minimum deposit amount is Rs. 100');
    }
  });
}


///-------------withdraw---------------///
document.getElementById('withdraw-btn').addEventListener('click',withdraw);
function withdraw(){
  document.getElementById('depoist-portal').style= "display:none ";
  document.getElementById('withdraw-portal').style= "display:inline-block";
  document.getElementById('transfer-portal').style= "display:none";
  document.getElementById('online-payment').style= "display:none";

  document.getElementById('wit-submit').addEventListener('click',function(){
    document.getElementById('withdraw-btn').removeEventListener('click',depoist);
    var withdrawAmt = Number(document.getElementById('withdraw-amt').value);
    if (withdrawAmt >= 100) {
      // Check if the withdraw amount is in multiples of 100
      if (withdrawAmt % 100 === 0) {
        if (withdrawAmt <= totalBal) {
          totalBal -= withdrawAmt;
          document.getElementById('withdraw-amt').value = '';
          msg = "Rs. " + withdrawAmt + " was successfully withdrawn";
          updateAvalBal(msg, totalBal);
        } else {
          alert('Invalid Balance');
        }
      } else {
        alert('Amount must be in multiples of Rs. 100');
      }
    } else {
      alert('Minimum withdrawal amount is Rs. 100');
    }
    
  });
}



//-----------------transfer------------------//
document.getElementById('transfer-btn').addEventListener('click', transfer);

function transfer() {
  document.getElementById('depoist-portal').style = "display:none ";
  document.getElementById('withdraw-portal').style = "display:none";
  document.getElementById('transfer-portal').style = "display:inline-block";
  document.getElementById('online-payment').style= "display:none";

  document.getElementById('trans-submit').addEventListener('click', function () {

    document.getElementById('transfer-btn').removeEventListener('click', transfer);

    var transAccNo = document.getElementById('transfer-acc-no').value;
    var transferAmt = Number(document.getElementById('transfer-amt').value);

    document.getElementById('transfer-acc-no').value = '';
    document.getElementById('transfer-amt').value = '';

    // Check if the account number exists in the database
    var accRef = ref(db, "accNo " + transAccNo);
    get(accRef).then((snapshot) => {
      if (snapshot.exists()) { // Account exists
        // Proceed with the transfer
        if (transferAmt >= 100 && transferAmt <= avalBal) {
          update(ref(db, "accNo " + transAccNo + "/received"), {
            receivedAmt: transferAmt
          }).then(() => {
            totalBal -= transferAmt;
            document.getElementById('withdraw-amt').value = '';
            var msg = "Rs. " + transferAmt + " was successfully transferred to " + transAccNo + "account number";
            updateAvalBal(msg, totalBal);
          }).catch((error) => {
            alert('Error: ' + error.message);
          });
        } else if (transferAmt <= 99) {
          alert('Minimum Transfer Amount Rs.100');
        } else {
          alert('Insufficient Funds in Your Account');
        }
      } else { // Account does not exist
        alert('Invalid Account Number');
      }
    }).catch((error) => {
      alert('Error: ' + error.message);
    });
  });
}

document.getElementById('bill-btn').addEventListener('click', function() {
  // Hide other sections
  document.getElementById('depoist-portal').style.display = "none";
  document.getElementById('withdraw-portal').style.display = "none";
  document.getElementById('transfer-portal').style.display = "none";

  // Show online payment section
  document.getElementById('online-payment').style.display = "block";
});

document.getElementById('make-payment-btn').addEventListener('click', makePayment);

function generateRandomAmount(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makePayment() {
  var paymentType = document.getElementById('payment-type').value;
  var billAmt = generateRandomAmount(500, 1500); // Generate amount between 500 and 1500

  // Display the generated amount for confirmation
  var confirmMsg = "The generated amount to be paid is Rs. " + billAmt + ". Do you want to proceed?";
  totalBal -= billAmt;
  if('tax'=== paymentType){
    if (totalBal >= billAmt) {
    var msg = "Rs. " + billAmt + " for Tax was successfully paid";
    updateAvalBal(msg, totalBal);}
    else{
      alert("Insufficient balance. Please deposit funds.");
    }

  }
  else if('electricity'=== paymentType){
    if (totalBal >= billAmt) {
    var msg = "Rs. " + billAmt + " for Electricity Bill was successfully paid";
    updateAvalBal(msg, totalBal);}
    else{
      alert("Insufficient balance. Please deposit funds.");
    }
  }
  else if('water'=== paymentType){
    if (totalBal >= billAmt) {
    var msg = "Rs. " + billAmt + " for Water Bill was successfully paid";
    updateAvalBal(msg, totalBal);}
    else{
      alert("Insufficient balance. Please deposit funds.");
    }
  }
  
  if (!confirm(confirmMsg)) {
      return; // Exit if the user doesn't confirm
  }
 



}



}

}

