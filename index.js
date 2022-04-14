const express = require("express")
const app = express()
const port = process.env.PORT || 3000;
const mongoose = require("mongoose");
const session = require("express-session")
const cors = require("cors")
const { createClient } = require('redis');
let RedisStore = require("connect-redis")(session)


const { MONGO_USER, MONGO_PASSWORD, MONGO_HOST, MONGO_PORT, REDIS_URL, REDIS_PORT, SESSION_SECRET } = require("./config/config");

let redisClient = createClient({
    legacyMode: true,
    socket: {
        host: REDIS_URL,
        port: REDIS_PORT
    }
});

redisClient.connect().catch(console.error)
//redisClient.ping();


const postRouter = require("./routes/postRoutes")
const userRouter = require("./routes/userRoutes")

const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/?authsource=admin`

const connectWithRetry = () => {
  mongoose
    .connect(mongoURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log(`Succesfully connected to DB`))
    .catch((e) => {
        console.log(e)
        setTimeout(connectWithRetry, 5000)
    });  
}

connectWithRetry();

app.enable("trust proxy")

app.use(cors({}))

app.use(
    session({
      store: new RedisStore({ client: redisClient }),
      secret: SESSION_SECRET,
      cookie: {
        secure: false, // true in prod
        resave: false,
        saveUninitialized: false,
        httpOnly: true,
        maxAge: 30000,
      },
    })
  );
app.use(express.json()); // add this middleware so express can attach and parse json body


app.listen(port, ()=> console.log(`listening on port ${port}`))

app.get("/api/v1", (req,res) => {
    res.send("<h2>Hi There DO!!</h2>");
    console.log("Yeah it loadbalanced")
});

//localhost:3000/api/v1/posts
app.use("/api/v1/posts", postRouter)
app.use("/api/v1/users", userRouter)