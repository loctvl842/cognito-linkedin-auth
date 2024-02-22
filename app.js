const express = require("express");
const url = require("url");
const session = require("express-session");
const AWS = require("aws-sdk");
const { CognitoIdentityServiceProvider } = AWS;
const { v4: uuidv4 } = require("uuid");
const FileStore = require("session-file-store")(session);
const axios = require("axios");
const qs = require("querystring");
const dotenv = require('dotenv')

dotenv.config();

const app = express();
const PORT = 8402;
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    store: new FileStore({ path: "/tmp/sessions" }),
    secret: "not so secret secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: 3600000,
    },
  }),
);

const cognito = new CognitoIdentityServiceProvider({
  region: process.env.AWS_REGION,
});

const exchangeCodeForToken = async (code) => {
  const url = `${process.env.COGNITO_USER_POOL_HOST}/oauth2/token`;
  const data = {
    grant_type: "authorization_code",
    client_id: process.env.AWS_COGNITO_USER_POOL_CLIENT_APP_ID,
    redirect_uri: process.env.REDIRECT_URI,
    client_secret: process.env.AWS_COGNITO_USER_POOL_CLIENT_APP_SECRET,
    code: code,
  };

  const response = await axios.post(url, qs.stringify(data), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  const { id_token, access_token, refresh_token } = response.data;
  return access_token;
};

const getUserInfo = async (accessToken) => {
  const params = {
    AccessToken: accessToken,
  };

  try {
    const data = await cognito.getUser(params).promise();
    return data.UserAttributes;
  } catch (error) {
    console.error("Error retrieving user info:", error);
    throw error;
  }
};

app.get("/", async (req, res) => {
  const token = req.session.token;
  const data = { token };
  if (token) {
    try {
      const user = await getUserInfo(token);

      // Extracting data
      const firstName = user.find((item) => item.Name === "given_name").Value;
      const lastName = user.find((item) => item.Name === "family_name").Value;
      const email = user.find((item) => item.Name === "email").Value;

      // Constructing the desired format
      const formattedData = `${firstName} ${lastName} - ${email}`;
      data.user = formattedData;
    } catch (error) {
      console.log("Error getting user info", error);
    }
  }
  res.render("index", data);
});

app.get("/login", (req, res) => {
  const uri = url.format({
    host: process.env.COGNITO_USER_POOL_HOST,
    pathname: "/login",
    query: {
      response_type: "code",
      client_id: process.env.AWS_COGNITO_USER_POOL_CLIENT_APP_ID,
      redirect_uri: "http://localhost:8402/auth/linkedin/callback",
      scope: "openid profile email aws.cognito.signin.user.admin",
    },
  });
  res.redirect(uri);
});

app.get("/auth/linkedin/callback", async (req, res) => {
  const { code, error } = req.query;
  if (error) {
    res.send(`${req.query.error_description}: ${req.query.error}`);
    return;
  }
  try {
    const token = await exchangeCodeForToken(code);
    req.session.token = token;
    res.redirect("/");
    return;
  } catch (error) {
    console.log("Error exchanging code for token", error);
    res.send(error);
    return;
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    res.redirect("/");
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
