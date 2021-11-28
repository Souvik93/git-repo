

const { Connection, Request } = require("tedious");
const express=require("express")
const mysql=require("mysql")
const app=express()
const server = require("http").createServer(app);
const ports= process.env.PORT || 3001
app.use(express.json());
app.use(express.urlencoded({
    extended:false
})
);


const config = {
  authentication: {
    options: {
      userName: "svk", // update me
      password: "Abcd@1234" // update me
    },
    type: "default"
  },
  server: "svkdas.database.windows.net", // update me
  options: {
    database: "svk", //update me
    encrypt: true
  }
};

const connection = new Connection(config);

// Attempt to connect and execute queries if connection goes through
connection.on("connect", err => {
  if (err) {
    console.error(err.message);
  } else {
    console.log("Connected");
    // queryDatabase();
  }
});

connection.connect();

//Sending information from front to back end
const cors=require("cors");
app.use(cors());
const io = require("socket.io")(server, {
	cors: {
		origin: "*", //Accept access from all origins
		methods: [ "GET", "POST" ]
	}
});
/* const db=mysql.createConnection({
    user:"root",
    host:"localhost",
    password: "",
    database:"test_db",
    port:"3306"
}); */

/* db.connect(function(err)
{
if(err)
    console.log("error in db connection")
else{
  console.log("Connected")
}
});  */
//After connecting to a socket ,what possible things we can do
io.on("connection", (socket) => {
    //Provide id of the caller to frontend
	socket.emit("me", socket.id);
//broadcast a message when disconnected to frontend
  socket.on("disconnect", () => {
		socket.broadcast.emit("callEnded")
	});
  //information about user to call to pass to frontend
	socket.on("callUser", ({ userToCall, signalData, from, name }) => {
		io.to(userToCall).emit("callUser", { signal: signalData, from, name });
	});
 //information about answering call to pass to frontend
	socket.on("answerCall", (data) => {
		io.to(data.to).emit("callAccepted", data.signal)
	});
});
app.post("/",(req,res)=>
{
    const username=req.body.username;
    const password=req.body.password;
	console.log(req.body);
    
  const request = new Request(
    "INSERT INTO utudent (username,password) VALUES ('"+username+"','"+password+"')",
    (err, rowCount) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log(`${rowCount} row(s) returned`);
      }
    }
  );
  
  connection.execSql(request);
  
  /* db.query("INSERT INTO register (username,password) VALUES (?,?)",
     [username,password],
      (err,result) =>{
        if(err)
        console.log(err);
       else
       {
           console.log(result);
       }
       }
        ); */
})


 app.post("/login",(req,res)=>
  {
    const username=req.body.username;
    const password=req.body.password;
    
    const request = new Request(
      "SELECT * FROM utudent WHERE username='"+username+"' AND password='"+password+"'",
      (err, rowCount) => {
        if (err) {
          console.error(err.message);
        } else {
          console.log(`${rowCount} row(s) returned`);
        }
      }
    );

    request.on("row", columns => {
      if(columns.length>0)
       res.send(result);
    else{
        res.send({message:"Incorrect username or password"});
    }

    connection.execSql(request);
      
    });


    /* db.query("SELECT * FROM register WHERE username=? AND password=?",
    [username,password],
     (err,result) =>{
       if(err)
       {
       res.send({err:err});
       console.log(err)
       }
    if(result.length>0)
       res.send(result);
    else{
        res.send({message:"Incorrect username or password"});
    }
      }
       ); */
  });

  server.listen(ports, () => console.log(`Server is running on port ${ports}`));
//   app.listen(ports,() => {
//     console.log("Running server");
// });