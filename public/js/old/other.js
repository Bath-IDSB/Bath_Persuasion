// setTimeout(() => {
   // Console.log("Move it, sessions about to finish")
  //}, 9000);
 // setTimeout(() => {
   // alert("Your session has finished now")
  //}, 1*60*1000);


//$("i.stopwatch.icon").addClass('red');



/*var start = Date.now();
function check()
{
  var delta=0;
  setInterval(function() 
    {
    var delta = Date.now() - start; // milliseconds elapsed since start
    console.log(Math.floor(delta / 1000)); // in seconds
    // alternatively just show wall clock time:
    //console.log(new Date().toUTCString());
    }, 1000); // update about every second
  }*/

//check();

//function check() {
       //var ms = parseInt($(this).text(), 10);
  //    var dt = new Date().toString();
    //    console.log('time: ',dt) ;
      //    if (dt <=sessionTime) 
          //{
        //    setTimeout(check, 5000);
          //} 
          //else 
          //{
            //location.reload();
          //}
       // }
      //}

//check();



/*function check() {
        var x = new XMLHttpRequest();
        x.open("GET","/feed");
        x.send();
        x.onload = function() 
        {
        console.log('Reponse: ', x.status);
          if (x.response !== "DONE") 
          {
            setTimeout(check, 5000);
          } 
          else 
          {
            location.reload();
          }
        }
      }
check();*/


/*setTimeout(check, 1200000);

function check() 
{
  alert("Your session has expired -You will be automatically logged out.");
   location.reload(1);
  //  window.location.href='/'; 
}

check();*/

/*setTimeout(function() 
{
    alert("Your session has now expired, you will be redirected to the Survey shortly."); 
    window.location="/com"; //Go to redirect page
    window.location.href='/';
}, 5*60*1000);*/

/*$('.ui.fluid.card .img').popup({ //pop up message on hovering over the picture
  position : 'left center',
  //target   : '.image',
  title    : 'Geeksforgeeks',
  content  : 'A Computer Science Portal'
});*/

    
//$("#Msg").show().delay(5000).fadeOut(); 

    /*function hideMsg()
    {
    alert("hi");
    $("span").fadeOut();
    }
    setTimeout(hideMsg,10000);*/


  setTimeout(function() //Fade a message away 
  {
    $('alert#Msg').transition(
    {
        //animation: 'fade down',
        animation: 'fly left',
        //animation: 'horizontal flip',
        //animation: 'vertical flip',
        //animation: 'drop',
        //animation: 'browse right',
        //animation: 'slide left',
        duration   : '3.5s',
    });
  }.bind(this), 3500);


/*setTimeout( function() 
  { 
    alert("Your session will expire in 1 minute."); 
  }, 60000);*/
