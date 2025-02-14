import time, re, random, names, uuid
from locust import HttpUser, task, between
from time import time


class TrumanTasks(HttpUser):

    wait_time = between(1,5)
    #min_wait = 100
    #max_wait = 300
    
    global username
    #actors = ['caffeinated','casssssssssie','bblueberryy','Lisa181818','artisanalways','Jcole9','difrad','earthpulse','breethebaker','kittycatbakes'] 

    def on_start(self):
        self.client.cookies.clear()
        username=names.get_full_name()
        prolificID= str(uuid.uuid4())
        res=self.client.get("/login")
        csrf=re.search('meta name="csrf-token" content="(.+?)"', res.text).group(1)
        print(csrf)
        self.client.post("/login", json={"username":username, "prolificID":prolificID,"_csrf":csrf})

        self.getSignupInfo()
        self.getInfo()
        self.getCom()
        #self.postPic()

    def getSignupInfo(self):
     self.client.get('/account/signup_info')

    def getInfo(self):
     self.client.get('/info')

    def getCom(self):
     self.client.get('/comll')

    @task
    def postPic(self):
      res=self.client.get("/feed")
      if re.search('meta name="csrf-token" content="(.+?)"', res.text) is not None:
         csrf = re.search('meta name="csrf-token" content="(.+?)"', res.text).group(1) 
         file='pic.jpeg'
         #file='bigPic.jpg'
         self.client.post('/post/new', json={"picinput":file,"body":"Healthy Food, I hope you like it","_csrf":csrf})
         #self.client.post('/post/new', {'picinput': open(file, 'rb'),"body":"Nice Post","_csrf":csrf})
         print('Posted a picture ')

    @task
    def getFeed(self):
        self.client.get("/feed")

    @task
    def likePost(self):
      res=self.client.get("/feed")
      if re.search('meta name="csrf-token" content="(.+?)"', res.text) is not None:
         csrf = re.search('meta name="csrf-token" content="(.+?)"', res.text).group(1) 
         now = time()
         postIDs=re.findall('postID="(.*?)"', res.text, re.DOTALL)
         postID=random.choice(postIDs)
         print('Liking Post Now')
         self.client.post( '/feed', json={ "postID": postID, "like":now, "_csrf":csrf})
         print(' Liked post # ',postID)

    @task
    def flagPost(self):
      res=self.client.get("/feed")
      if re.search('meta name="csrf-token" content="(.+?)"', res.text) is not None:
         csrf = re.search('meta name="csrf-token" content="(.+?)"', res.text).group(1)
         now = time()
         postIDs=re.findall('postID="(.*?)"', res.text, re.DOTALL)
         postID=random.choice(postIDs)
         print("Flagging Post Now")
         self.client.post( '/feed', json={ "postID": postID, "flag":now, "_csrf":csrf})
         print('Flagged post #: '+postID)

    @task
    def likeComment(self):
      res=self.client.get("/feed")
      if re.search('meta name="csrf-token" content="(.+?)"', res.text) is not None:
         csrf = re.search('meta name="csrf-token" content="(.+?)"', res.text).group(1)
         now = time()
         postIDs=re.findall('postID="(.*?)"', res.text, re.DOTALL)
         postID=random.choice(postIDs)
         commentIDs=re.findall('commentID="(.*?)"', res.text, re.DOTALL)
         commentID=random.choice(commentIDs)
         print("Liking a Comment Now")
         self.client.post( '/feed', json={"postID":postID,"commentID": commentID, "like":now, "_csrf":csrf})
         print('Liked a comment #: '+commentID)

    @task
    def flagComment(self):
      res=self.client.get("/feed")
      if re.search('meta name="csrf-token" content="(.+?)"', res.text) is not None:
         csrf = re.search('meta name="csrf-token" content="(.+?)"', res.text).group(1)
         now = time()
         postIDs=re.findall('postID="(.*?)"', res.text, re.DOTALL)
         postID=random.choice(postIDs)
         commentIDs=re.findall('commentID="(.*?)"', res.text, re.DOTALL)
         commentID=random.choice(commentIDs)
         print("Liking a Comment Now")
         self.client.post( '/feed', json={"postID":postID,"commentID": commentID, "flag":now, "_csrf":csrf})
         print('Flagged a comment #: '+commentID)

    @task
    def postComment(self):
      comments=['Hello there','nice meal','looks yummy','Amazing food, thanks for sharing']
      text=random.choice(comments)
      print('Commenting Now')
      res=self.client.get("/feed")
      if re.search('meta name="csrf-token" content="(.+?)"', res.text) is not None:
         csrf = re.search('meta name="csrf-token" content="(.+?)"', res.text).group(1)
         now = time()
         postIDs=re.findall('postID="(.*?)"', res.text, re.DOTALL)
         postID=random.choice(postIDs)
         self.client.post( '/feed', json={ "postID": postID, "new_comment":now,"comment_text":text,"_csrf":csrf})
         print('Commented on post: '+postID+' saying '+"'"+text+"'")

    @task
    def reportActor(self):
      actors = ['caffeinated','casssssssssie','bblueberryy','Lisa181818','artisanalways','Jcole9','difrad','earthpulse','breethebaker','kittycatbakes'] 
      issues=['interested','spam','bully','hacked']
      actID=random.choice(actors)
      issue=random.choice(issues)
      print('Reporting Actor Now')
      res=self.client.get('/user/'+actID)
      if re.search('meta name="csrf-token" content="(.+?)"', res.text) is not None:
         csrf = re.search('meta name="csrf-token" content="(.+?)"', res.text).group(1)
         self.client.post( '/user', json={ "report_issue":issue, "reported":actID,"_csrf":csrf})
         print('Reported Actor: '+actID)

    @task
    def messageActor(self):
      messages=['Hello there','Your posts are nice','You are very rude', 'WOW', ':)', 'I hope you like the food','You OK?']
      actors = ['caffeinated','casssssssssie','bblueberryy','Lisa181818','artisanalways','Jcole9','difrad','earthpulse','breethebaker','kittycatbakes'] 
      actID=random.choice(actors)
      pvt_message=random.choice(messages)
      print('Reporting Actor Now')
      res=self.client.get('/user/'+actID)
      if re.search('meta name="csrf-token" content="(.+?)"', res.text) is not None:
         csrf = re.search('meta name="csrf-token" content="(.+?)"', res.text).group(1)
         self.client.post( '/user', json={ "pvt_message":pvt_message, "messaged":actID,"_csrf":csrf})
         print('Messaged an Actor: '+actID+' saying: '+"'"+pvt_message+"'")

    @task
    def blockActor(self):
      actors = ['caffeinated','casssssssssie','bblueberryy','Lisa181818','artisanalways','Jcole9','difrad','earthpulse','breethebaker','kittycatbakes'] 
      actID=random.choice(actors)
      res=self.client.get('/user/'+actID)
      if re.search('meta name="csrf-token" content="(.+?)"', res.text) is not None:
         csrf = re.search('meta name="csrf-token" content="(.+?)"', res.text).group(1)
         print('Blocking an Actor Now')
         self.client.post( '/user', json={ "blocked":actID,"_csrf":csrf})
         print('Blocked Actor: '+actID)

    @task
    def unblockActor(self):
      actors = ['caffeinated','casssssssssie','bblueberryy','Lisa181818','artisanalways','Jcole9','difrad','earthpulse','breethebaker','kittycatbakes'] 
      actID=random.choice(actors)
      res=self.client.get('/user/'+actID)
      if re.search('meta name="csrf-token" content="(.+?)"', res.text) is not None:
         csrf = re.search('meta name="csrf-token" content="(.+?)"', res.text).group(1)
         print('Unblocking an Actor Now')
         self.client.post( '/user', json={ "unblocked":actID,"_csrf":csrf})
         print('UnBlocked Actor: '+actID)    

    @task
    def getMe(self):
         self.client.get("/me")

    @task
    def getUser(self):
     actors = ['caffeinated','casssssssssie','bblueberryy','Lisa181818','artisanalways','Jcole9','difrad','earthpulse','breethebaker','kittycatbakes'] 
     actID=random.choice(actors)
     print('Viewing '+actID)
     self.client.get('/user/'+actID)

    @task
    def getNotifications(self):
        self.client.get("/notifications")