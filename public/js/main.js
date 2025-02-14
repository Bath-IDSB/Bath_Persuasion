//$(document).ready(function() {

//Before Page load:
$('#content').hide();
$('#loading').show();

$(window).on("load", function() 
{
  //close loading dimmer on load
  $('#loading').hide();
  $('#content').attr('style', 'block');
  $('#content').fadeIn('slow');
  //close messages from flash message
  $('.message .close').on('click', function() 
  {
    $(this).closest('.message').transition('fade');
  });

/**************************************************************************************************************
                                               Check the Bell(!)                                            
***************************************************************************************************************/
  if (!(top.location.pathname === '/login' || top.location.pathname === '/signup'))
  {
    $.getJSON( "/bell", function( json ) 
    {
    if (json.result)
      {
        $("i.big.alarm.icon").replaceWith( '<i class="big icons"><i class="red alarm icon"></i><i class="corner yellow lightning icon"></i></i>' );
      }

    });
  }

  //make checkbox work
  $('.ui.checkbox').checkbox();

  $(' .ui.tiny.post.modal').modal({
      observeChanges  : true
    })
  ;

  //get add new feed post modal to work
  $("#newpost, a.item.newpost").click(function () 
  {
    $(' .ui.tiny.post.modal').modal('show');
  });

/**************************************************************************************************************
                          Validate new usre post (picture and text can not be empty)                         
***************************************************************************************************************/
  $('.ui.feed.form').form(
  {
    on: 'blur',
    fields: {
      body: 
      {
        identifier  : 'body',
        rules: 
        [
          {
            type   : 'empty',
            prompt : 'Please add some text about your meal'
          }
        ]
      },
      picinput: 
      {
        identifier  : 'picinput',
        rules: 
        [
          {
            type: 'notExactly[/public/photo-camera.svg]',
            prompt : 'Please click on Camera Icon to add a photo'
          }
        ]
      }
    },

    onSuccess:function(event, fields)
    {
      console.log("Event is :");
      //console.log(event);
      console.log("fields is :");
      //console.log(fields);
      $(".ui.feed.form")[0].submit();
    }
  });

  $('.ui.feed.form').submit(function(e) 
  {
    e.preventDefault();
    console.log("Submit the junks!!!!")
    //$('.ui.tiny.nudge.modal').modal('show');
    //return true;
  });

/**************************************************************************************************************
                              Picture Preview on Image Selection                                               
***************************************************************************************************************/
  function readURL(input) 
    {
      if (input.files && input.files[0]) 
      {
          var reader = new FileReader();
          //console.log("Now changing a photo");
          reader.onload = function (e) 
          {
              $('#imgInp').attr('src', e.target.result);
              //console.log("FILE is "+ e.target.result);
          }

            reader.readAsDataURL(input.files[0]);
      }
    }

  $("#picinput").change(function()
    {
        //console.log("@@@@@ changing a photo");
        readURL(this);
    });

/**************************************************************************************************************
                            Modal to show "other users" in Notifications                                     
***************************************************************************************************************/
/*$('a.others').click(function(){
  let key = $(this).attr('key');


  $('.ui.long.extrausers.modal#'+key).modal({
    onVisible: function() {
      var el = document.querySelector('.ui.long.extrausers.modal#'+key+" div.ui.extra.divided.items");
      var lazyLoad = new LazyLoad({
         container: el /// <--- not sure if this works here, read below
    });

    }
  }).modal('show')
}); */

/**************************************************************************************************************
                                           add humanized time to all posts                                   
***************************************************************************************************************/
  $('.right.floated.time.meta, .date').each(function() 
  {
    var ms = parseInt($(this).text(), 10);
    let time = new Date(ms);
    $(this).text(humanized_time_span(time));
  });

/**************************************************************************************************************
                                          Diverse Actions                                                    
***************************************************************************************************************/
  //Sign Up Button
  //$('.ui.big.green.labeled.icon.button.signup').on('click', function() 
    //{
      //window.location.href='/signup';
    //});

  //Sign Up Info Skip Button
  $('button.ui.button.skip').on('click', function() 
    {
      window.location.href='/com';
    });

  //Community Rules Button (rocket!!!)
  $('.ui.big.green.labeled.icon.button.com').on('click', function() 
    {
        window.location.href='/info'; //maybe go to tour site???
    });

  //Community Rules Button (rocket!!!)
  $('.ui.big.green.labeled.icon.button.info').on('click', function() 
    {
      window.location.href='/'; //maybe go to tour site???
    });

  //Profile explaination Page
  $('.ui.big.green.labeled.icon.button.profile').on('click', function() 
    {
      window.location.href='/profile_info'; //maybe go to tour site???
    });

  //More info Skip Button
  $('button.ui.button.skip').on('click', function() 
    {
      window.location.href='/com'; //maybe go to tour site???
    });

  //Edit button
  $('.ui.editprofile.button').on('click', function() 
    {
      window.location.href='/account';
    });


//get add new reply post modal to show
$('.reply.button').click(function () 
  { 
    $(this).closest( ".ui.fluid.card" ).find( "input.newcomment" ).focus();
});


/**************************************************************************************************************
                                         Report an Actor                                                     
***************************************************************************************************************/
  $('button.ui.button.report').on('click', function() 
  {
      var username = $(this).attr( "username" );
      
      $('.ui.small.report.modal').modal('show');
      $('.coupled.modal').modal(
      {
        allowMultiple: false
      });

    // attach events to buttons
    $('.first.modal').modal('attach events', '.report.modal .button');
    // show first now
    $('.ui.small.report.modal').modal('show');
  });

  $('form#reportform').submit(function(e)
  {
      e.preventDefault();
      $.post($(this).attr('action'), $(this).serialize(), function(res)
        {
          // Do something with the response `res`
          console.log(res);
          // Don't forget to hide the loading indicator!
        });
    //return false; // prevent default action
  });

/**************************************************************************************************************
                                           PM an Actor                                              
***************************************************************************************************************/
  $('button.ui.button.msg').on('click', function() 
  {
    var username = $(this).attr( "username" );
    
    $('#pvt_message').val('');

    $('.ui.small.message.modal').modal('show');
    
    $('.coupled.modal').modal({allowMultiple: false});

  });

/**************************************************************************************************************
                                           Validate User PM                                              
***************************************************************************************************************/

$('form#messageform').form(
  {
    fields: {
      pvt_message: 
      {
        identifier  : 'pvt_message',
        rules: 
        [
          {
            type   : 'empty',
            prompt : 'Please add text to the message.'
          }
        ]
      }
    },
    onSuccess:function(event, fields)
    {
      $('form#messageform').submit(event);
    }

  });

$('form#messageform').submit(function(e)
  {
      e.preventDefault();
      if($('#pvt_message').val().trim().length > 0)
      {
      $.post($(this).attr('action'), $(this).serialize(), function(res)
        {
          $('.second.modal').modal('show');
        });
      }
    //return false; // prevent default action
  });


  $('.ui.home.inverted.button').on('click', function() 
  {
    window.location.href='/';
  });

/**************************************************************************************************************
                                                 Block an Actor                                                 
***************************************************************************************************************/
  $('button.ui.button.block')
  .on('click', function() 
  {

    var username = $(this).attr( "username" );
    //Modal for Blocked Users
    $('.ui.small.basic.blocked.modal').modal(
      {
        closable  : false,
        onDeny    : function()
        {
          //report user
        },
        onApprove : function() {
          //unblock user
          $.post( "/user", { unblocked: username, _csrf : $('meta[name="csrf-token"]').attr('content') } );
        }
      }).modal('show');

    console.log("***********Block USER "+username);
    $.post( "/user", { blocked: username, _csrf : $('meta[name="csrf-token"]').attr('content')});
  });
/**************************************************************************************************************
                             Block Modal for User that is already Blocked                                    
***************************************************************************************************************/
  $('.ui.on.small.basic.blocked.modal')
  .modal(
  {
    closable  : false,
    onDeny    : function()
    {
      //report user

    },
    onApprove : function() 
    {
      //unblock user
      var username = $('button.ui.button.block').attr( "username" );
      $.post( "/user", { unblocked: username, _csrf : $('meta[name="csrf-token"]').attr('content')});
    }
  }).modal('show');

/**************************************************************************************************************
                                  Like a Post Button                                                  
***************************************************************************************************************/
 /* $('.like.button').on('click', function() 
  {
    //if already liked, unlike if pressed
    if ( $( this ).hasClass( "red" ) ) 
    {
        console.log("***********UNLIKE: post");
        $( this ).removeClass("red");
        var label = $(this).next("a.ui.basic.red.left.pointing.label.count");
        label.html(function(i, val) { return val*1-1 });
        
        var postID = $(this).closest( ".ui.fluid.card" ).attr( "postID" );
        console.log(postID);
        var like = Date.now();
        console.log("***********UNLIKE: post "+postID+" at time "+like);
        if ($(this).closest( ".ui.fluid.card" ).attr( "type" )=='userPost')
          $.post( "/userPost_feed", { postID: postID, like: like, _csrf : $('meta[name="csrf-token"]').attr('content')});
        else
          $.post( "/feed", { postID: postID, like: like, _csrf : $('meta[name="csrf-token"]').attr('content')});
    }
    //since not red, this button press is a LIKE action
    else
    {
        $(this).addClass("red");
        var label = $(this).next("a.ui.basic.red.left.pointing.label.count");
        label.html(function(i, val) { return val*1+1 });
        var postID = $(this).closest( ".ui.fluid.card" ).attr( "postID" );
        var like = Date.now();
        console.log("***********LIKE: post "+postID+" at time "+like);
        if ($(this).closest( ".ui.fluid.card" ).attr( "type" )=='userPost')
          $.post( "/userPost_feed", { postID: postID, like: like, _csrf : $('meta[name="csrf-token"]').attr('content')});
        else
          $.post( "/feed", { postID: postID, like: like, _csrf : $('meta[name="csrf-token"]').attr('content')});
    }
  });*/


/***********************************************************************************************************************
*                                           LIKE BUTTON                                                     *
***********************************************************************************************************************/

$('.like.button').on('click', function() 
  {
    //if already liked, unlike if pressed
    if ( $( this ).hasClass( "green" ) ) 
    {
        $( this ).removeClass("green");
        $( this ).closest(".ui.bottom.attached.icon.buttons").find(".dislike.button").removeClass('disabled');

        var label = $(this).next("a.ui.basic.green.left.pointing.label.count");
        label.html(function(i, val) { return val*1-1 });

        var postID = $(this).closest( ".ui.fluid.card" ).attr( "postID" );
        var like = Date.now();
        
        console.log("***********UNLIKE: post "+postID+" at time "+like);
        
        //if ($(this).closest( ".ui.fluid.card" ).attr( "type" )=='userPost')
          //$.post( "/userPost_feed", { postID: postID, like: like, _csrf : $('meta[name="csrf-token"]').attr('content')});
        //else
          $.post( "/feed", { postID: postID, like: like, _csrf : $('meta[name="csrf-token"]').attr('content')});
    }
    //since not red, this button press is a LIKE action
    else
    {
        $(this).addClass("green");
        $( this ).closest(".ui.bottom.attached.icon.buttons").find(".dislike.button").addClass('disabled');
        var label = $(this).next("a.ui.basic.green.left.pointing.label.count");
        label.html(function(i, val) { return val*1+1 });
        var postID = $(this).closest( ".ui.fluid.card" ).attr( "postID" );
        var like = Date.now();
        console.log("***********LIKE: post "+postID+" at time "+like);
        //if ($(this).closest( ".ui.fluid.card" ).attr( "type" )=='userPost')
          //$.post( "/userPost_feed", { postID: postID, like: like, _csrf : $('meta[name="csrf-token"]').attr('content')});
        //else
          $.post( "/feed", { postID: postID, like: like, _csrf : $('meta[name="csrf-token"]').attr('content')});
    }
  });

/***********************************************************************************************************************
*                                           DISLIKE POST BUTTON                                                     *
***********************************************************************************************************************/

$('.dislike.button').on('click', function() 
  {
    //if already disliked, undislike if pressed
    if ( $( this ).hasClass( "red" ) ) 
    {
        $( this ).removeClass("red");
        $( this ).closest(".ui.bottom.attached.icon.buttons").find(".like.button").removeClass('disabled');
        
        var label = $(this).next("a.ui.basic.red.left.label.count");
        label.html(function(i, val) { return val*1-1 });

        var postID = $(this).closest( ".ui.fluid.card" ).attr( "postID" );
        var dislike = Date.now();
        console.log("***********UNDISLIKE: post "+postID+" at time "+dislike);
        $.post( "/feed", { postID: postID, dislike: dislike, _csrf : $('meta[name="csrf-token"]').attr('content')});
    }
    //since not red, this button press is a DISLIKE action
    else
    {
        $(this).addClass("red");
        $( this ).closest(".like.button").addClass('disabled');
        $( this ).closest(".ui.bottom.attached.icon.buttons").find(".like.button").addClass('disabled');

        var label = $(this).next("a.ui.basic.red.left.label.count");
        label.html(function(i, val) { return val*1+1 });

        var postID = $(this).closest( ".ui.fluid.card" ).attr( "postID" );
        var dislike = Date.now();
        console.log("***********DISLIKE: post "+postID+" at time "+dislike);
        $.post( "/feed", { postID: postID, dislike: dislike, _csrf : $('meta[name="csrf-token"]').attr('content')});
    }
  });

/**************************************************************************************************************
                                             Flag a Post                                                
***************************************************************************************************************/
  $('.flag.button').on('click', function() 
  {
     var post = $(this).closest( ".ui.fluid.card.dim");
     var postID = post.attr("postID");
     var flag = Date.now();
     console.log("***********FLAG: post "+postID+" at time "+flag);
     $.post( "/feed", { postID: postID, flag: flag, _csrf : $('meta[name="csrf-token"]').attr('content')});
     console.log("Removing Post content now!");
     post.find(".ui.dimmer.flag").dimmer(
      {
        closable: false
      }).dimmer('show');
      //repeat to ensure its closable
      post.find(".ui.dimmer.flag").dimmer(
        {
          closable: false
        }).dimmer('show');
  });

/**************************************************************************************************************
                                           Create a new Comment                                              
***************************************************************************************************************/
  $("input.newcomment").keyup(function(event) 
  {
      //i.big.send.link.icon
     //$(this).siblings( "i.big.send.link.icon")
     if (event.keyCode === 13) 
     {
        $(this).siblings( "i.big.send.link.icon").click();
      }

      //location.reload();
  });

  $("i.big.send.link.icon").click(function() 
  {
      var text = $(this).siblings( "input.newcomment").val();
      var card = $(this).parents( ".ui.fluid.card" );
      var comments = card.find( ".ui.comments" )
      //no comments area - add it
      console.log("Comments is now "+comments.length)
      if( !comments.length )
      {
        //.three.ui.bottom.attached.icon.buttons
        console.log("Adding new Comments sections")
        var buttons = card.find( ".three.ui.bottom.attached.icon.buttons" )
        buttons.after( '<div class="content"><div class="ui comments"></div>' );
        var comments = card.find( ".ui.comments" )
      }
      if (text.trim() !== '')
      {
          console.log(text)
          var date = Date.now();
          var ava = $(this).siblings('.ui.label').find('img.ui.avatar.image');
          var ava_img = ava.attr( "src" );
          var ava_name = ava.attr( "name" );
          var postID = card.attr( "postID" );

          //var mess = '<div class="comment"> <a class="avatar"> <img src="'+ava_img+'"> </a> <div class="content"> <a class="author">'+ava_name+'</a> <div class="metadata"> <span class="date">'+humanized_time_span(date)+'</span> <i class="heart icon"></i> 0 Likes </div> <div class="text">'+text+'</div> <div class="actions"> <a class="like">Like</a> <a class="flag">Flag</a> </div> </div> </div>';
          var mess = '<div class="comment"> <a class="avatar"> <img src="'+ava_img+'"> </a> <div class="content"> <a class="author">'+ava_name+'</a> <div class="metadata"> <span class="date">'+humanized_time_span(date)+'</span> <i class="heart icon"></i> 0 Likes </div> <div class="text">'+text+'</div> <div class="actions"> <a class="like"> </a> <a class="flag"> </a> </div> </div> </div>';
          
          $(this).siblings( "input.newcomment").val('');
          comments.append(mess);
          console.log("######### NEW COMMENTS:  PostID: "+postID+", new_comment time is "+date+" and text is "+text);
          if (card.attr( "type" )=='userPost')
          $.post( "/userPost_feed", { postID: postID, new_comment: date, comment_text: text, _csrf : $('meta[name="csrf-token"]').attr('content') } );
    else
          $.post( "/feed", { postID: postID, new_comment: date, comment_text: text, _csrf : $('meta[name="csrf-token"]').attr('content') } );
      }
  });

/**************************************************************************************************************
                                           Like a Comment                                                    
***************************************************************************************************************/
  
  $('a.like.comment').on('click', function() 
  {
    //if already liked, unlike if pressed
    if ( $( this ).hasClass( "red" )) 
    {
        console.log("***********UNLIKE: post");
        //Un read Like Button
        $( this ).removeClass("red");

        var comment = $(this).parents( ".comment" );
        comment.find( "i.heart.icon" ).removeClass("red");

        var label = comment.find( "span.num" );
        label.html(function(i, val) { return val*1-1 });

      var postID = $(this).closest( ".ui.fluid.card" ).attr( "postID" );
      var commentID = comment.attr("commentID");
      var like = Date.now();
      console.log("#########COMMENT LIKE:  PostID: "+postID+", Comment ID: "+commentID+" at time "+like);

      if ($(this).closest( ".ui.fluid.card" ).attr( "type" )=='userPost')
        $.post( "/userPost_feed", { postID: postID, commentID: commentID, like: like, _csrf : $('meta[name="csrf-token"]').attr('content')});
      else
        $.post( "/feed", { postID: postID, commentID: commentID, like: like, _csrf : $('meta[name="csrf-token"]').attr('content')});
    }
    //since not red, this button press is a LIKE action
    else
    {
      $(this).addClass("red");
      var comment = $(this).parents( ".comment" );
      comment.find( "i.heart.icon" ).addClass("red");

      var label = comment.find( "span.num" );
      label.html(function(i, val) { return val*1+1 });

      var postID = $(this).closest( ".ui.fluid.card" ).attr( "postID" );
      var commentID = comment.attr("commentID");
      var like = Date.now();
      console.log("#########COMMENT LIKE:  PostID: "+postID+", Comment ID: "+commentID+" at time "+like);

      if ($(this).closest( ".ui.fluid.card" ).attr( "type" )=='userPost')
        $.post( "/userPost_feed", { postID: postID, commentID: commentID, like: like, _csrf : $('meta[name="csrf-token"]').attr('content')});
      else
        $.post( "/feed", { postID: postID, commentID: commentID, like: like, _csrf : $('meta[name="csrf-token"]').attr('content')});
    }
  });

/**************************************************************************************************************
                                           Flag a Comment                                             
***************************************************************************************************************/
  $('a.flag.comment').on('click', function() 
  {
    var comment = $(this).parents( ".comment" );
    var postID = $(this).closest( ".ui.fluid.card" ).attr( "postID" );
    var typeID = $(this).closest( ".ui.fluid.card" ).attr( "type" );
    var commentID = comment.attr("commentID");
    comment.replaceWith( '<div class="comment" style="background-color:black;color:white"><h4 class="ui inverted header"><span>The admins will review this post further. Thank you for your help.</span></h4></div>');
    var flag = Date.now();
    console.log("#########COMMENT FLAG:  PostID: "+postID+", Comment ID: "+commentID+"  TYPE is "+typeID+" at time "+flag);

    if (typeID=='userPost')
      $.post( "/userPost_feed", { postID: postID, commentID: commentID, flag: flag, _csrf : $('meta[name="csrf-token"]').attr('content') } );
    else
      $.post( "/feed", { postID: postID, commentID: commentID, flag: flag, _csrf : $('meta[name="csrf-token"]').attr('content')});
  });

/******************************************************************************************************************
                                         User wants to REREAD   (REVEAL)                                           
*******************************************************************************************************************/
  $('.ui.button.reread').on('click', function() 
  {
    //.ui.active.dimmer
    $(this).closest( ".ui.dimmer" ).removeClass( "active" );
    $(this).closest( ".ui.fluid.card.dim" ).find(".ui.inverted.read.dimmer").dimmer('hide');

     var postID = $(this).closest( ".ui.fluid.card.dim" ).attr( "postID" );
     var reread = Date.now();
     console.log("##########REREAD######SEND TO DB######: post "+postID+" at time "+reread);
     $.post( "/feed", { postID: postID, start: reread, _csrf : $('meta[name="csrf-token"]').attr('content') } );
     //maybe send this later, when we have a re-read event to time???
     //$.post( "/feed", { postID: postID, like: like, _csrf : $('meta[name="csrf-token"]').attr('content') } );
  });

/******************************************************************************************************************
                                      Show Group Message                                            
*******************************************************************************************************************/
//Fix group message

/*$('#groupMsg').visibility({
      //type:'fixed',
       offset : 50,
       //observeChanges:true
    });*/

/*$('.message .close').on('click', function() {
    $(this).closest('.message').transition('close');
  });*/

//Fill in the ProlificID 
const url = new URL(window.location.href);
const prolific= url.searchParams.get('id');
$('#prolificID').val(prolific);
//$('#prolificID').attr('readonly',true);

var POST_SURVEY='https://cornell.qualtrics.com/jfe/form/SV_0dK6TRfe3HfC6ax?id=' //shouldn't be here!

// no need uploading at these places
if ( document.URL.includes("/user/") || document.URL.includes("/me") || document.URL.includes("/notification") ) {
    $('a.item.newpost').hide();
}


// Add timer for the sessions. Alert user beforer time up

    var timer = setInterval(sessionTimer, 1000);
    const sessionTime = (15*60*1000);
    const alertTime=(12*60*1000);
    //const hideNewPost =(14*60*1000)+(30000);
    var alertSnd = new Audio("/public/ding.mp3");
    const createDate=$('#alertMsg').attr("createTime");
    //console.log("CreateDate:",createDate);
    let alerted=false;
    let active=true; //user status (active)
  
  if(typeof(createDate)=="undefined")
      {clearInterval(timer)}

    function sessionTimer() 
    {        
      timePassed = Date.now() - createDate;

      if ((timePassed >= alertTime) && (!alerted))
          {
            alerted=true;
            console.log("alerted =",alerted);
            alertSnd.play();
            //$('#alertMsg').sticky({pushing:true}).visibility({type:'fixed',offset : 55});
            $('#alertMsg').show();
            $('#timer').css('color', 'red');
          }

      /*if ((timePassed >= hideNewPost))
          {
            $('#newpost').hide();
             $('a.item.newpost').addClass('disabled');
            $('a.item.newpost').off('click');
          }*/

      if(timePassed>=sessionTime)
      {
        $.get('/user_status',function (data, textStatus, jqXHR) {  // success callback
        if(textStatus==='success')            {
             prolificID=data.prolificID;
             //amplify.store( "prolificID", {prolificID: data.prolificID});
             //var retrievedValue = amplify.store( "yourObject" );
             POST_SURVEY+=data.prolificID;
             var active=data.active;
             console.log('post_url:' + POST_SURVEY);
             clearInterval(timer);
          timer=null;
        //window.location.href = window.location;
        console.log('post_url:', POST_SURVEY);
        window.location.replace(POST_SURVEY);
        console.log("Redirected to Post_Survey Successfully");
           }
      var finishTime = Date.now();
      if(active)
     $.post("/post_status", {finishTime: finishTime,_csrf : $('meta[name="csrf-token"]').attr('content')});
      });
      }
      
      var timeLeft = sessionTime-timePassed;

      if(timeLeft<0)
      {
        $('#timer').text('Time Left: '+0+' m '+0+' s');
        $('#alertMsg').hide();
       }
      else {
       var minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
       var seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    $('#timer').text('Time Left: '+minutes+' m '+seconds+' s');
    $('#alertMsg .header').text('Your session will expire in '+minutes+' m '+seconds+' s');
    }
  }

});