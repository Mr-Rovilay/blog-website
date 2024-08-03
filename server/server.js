import express from "express";
import connectDB from "./db/db.js";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcrypt";
import User from "./Schema/User.js";
import Blog from "./Schema/Blog.js";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import admin from "firebase-admin";
import serviceAccountKey from "./chelsea-blog-6c370-firebase-adminsdk-a101g-a38a1b47d0.json" assert { type: "json" };
import { getAuth } from "firebase-admin/auth";
import aws from "aws-sdk";

const server = express();
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});

server.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

dotenv.config();

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

server.use(cors());
server.use(express.urlencoded({ extended: true }));
server.use(express.json({ limit: "50mb" }));

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    return res.status(401).json({ error: "No access token" });
  }
  jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Access token is invalid" });
    }
    req.user = user.id;
    next();
  });
};
const formatDataToSend = (user) => {
  const access_token = jwt.sign(
    { id: user._id },
    process.env.SECRET_ACCESS_KEY
  );
  return {
    access_token,
    profile_img: user.personal_info.profile_img,
    username: user.personal_info.username,
    fullname: user.personal_info.fullname,
  };
};

const generateUsername = async (email) => {
  let username = email.split("@")[0];
  let isUsernameNotUnique = await User.exists({
    "personal_info.username": username,
  }).then((result) => result);

  isUsernameNotUnique ? (username += nanoid().substring(0, 5)) : "";
  return username;
};

const s3 = new aws.S3({
  region: "eu-north-1",
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const generateUploadURL = async () => {
  const date = new Date();
  const imageName = `${nanoid()}-${date.getTime()}.jpeg`;

  return await s3.getSignedUrlPromise("putObject", {
    Bucket: "chelseablog",
    Key: imageName,
    Expires: 1000,
    ContentType: "image/jpeg",
  });
};

server.get("/get-upload-url", (req, res) => {
  generateUploadURL()
    .then((url) => res.status(200).json({ uploadURL: url }))
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ err: err.message });
    });
});

server.post("/signup", (req, res) => {
  let { fullname, email, password } = req.body;
  if (fullname.length < 3) {
    return res
      .status(403)
      .json({ error: "Fullname must be at least 3 characters long" });
  }
  if (!email.length) {
    return res.status(403).json({ error: "Enter email address" });
  }
  if (!emailRegex.test(email)) {
    return res.status(403).json({ error: "invalid email address" });
  }
  if (!passwordRegex.test(password)) {
    return res.status(403).json({
      error:
        "password should be 6 to 20 characters long with numeric, 1 lowercase and 1 uppercase letter",
    });
  }

  bcrypt.hash(password, 10, async (err, hashed_password) => {
    let username = await generateUsername(email);
    let user = new User({
      personal_info: {
        fullname,
        email,
        password: hashed_password,
        username,
      },
    });
    user
      .save()
      .then((u) => {
        return res.status(200).json(formatDataToSend(u));
      })
      .catch((err) => {
        if (err.code === 11000) {
          return res.status(500).json({ error: "email already exists" });
        }
        return res.status(500).json({ error: err.message });
      });
  });
});

server.post("/signin", (req, res) => {
  let { email, password } = req.body;

  User.findOne({ "personal_info.email": email })
    .then((user) => {
      if (!user) {
        return res.status(403).json({ error: "Email not found" });
      }

      if (!user.google_auth) {
        bcrypt.compare(password, user.personal_info.password, (err, result) => {
          if (err) {
            return res.status(403).json({
              error: "Error occur while login in please try again",
            });
          }

          if (!result) {
            return res.status(403).json({ error: "incorrect password" });
          } else {
            return res.status(200).json(formatDataToSend(user));
          }
        });
      } else {
        return res.status(403).json({
          error: "Account was created using google. Try Logging in with google",
        });
      }
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});



server.post("/google-auth", async (req, res) => {
  let { access_token } = req.body;
  getAuth()
    .verifyIdToken(access_token)
    .then(async (decodedUser) => {
      let { email, name, picture } = decodedUser;
      picture = picture.replace("s96-c", "s384-c");
      let user = await User.findOne({ "personal_info.email": email })
        .select(
          "personal_info.fullname personal_info.username personal_info.profile_img google_auth"
        )
        .then((u) => {
          return u || null;
        })
        .catch((err) => {
          return res.status(500).json({ error: err.message });
        });
      if (user) {
        if (!user.google_auth) {
          return res.status(403).json({
            error:
              "This email was signed up without google. please login with password to access the account",
          });
        }
      } else {
        let username = await generateUsername(email);
        user = new User({
          personal_info: {
            fullname: name,
            email,
            username,
          },
          google_auth: true,
        });

        await user
          .save()
          .then((u) => {
            user = u;
          })
          .catch((err) => {
            return res.status(500).json({ error: err.message });
          });
      }
      return res.status(200).json(formatDataToSend(user));
    })
    .catch((err) => {
      return res.status(500).json({
        error:
          "Failed to authenticate you with google. Try with another google account",
      });
    });
});

server.post('/latest-blogs', (req, res) => {
  let page = req.body
  let maxLimit = 100;
  Blog.find({draft: false})
  .populate('author', 'personal_info.profile_img personal_info.username personal_info.fullname -_id')
  .sort({ 'publishedAt': -1 })
  .select('blog_id title des banner activity tags publishedAt -_id')
  .skip((page - 1) * maxLimit)
  .limit(maxLimit)
  .then(blogs => {
    return res.status(200).json({ blogs: blogs });
  }).catch(err => {
    return res.status(500).json({err: err.message });
  })
})

server.post("/all-latest-blogs-count", (req, res) => {
  Blog.countDocuments({ draft: false })
   .then((count) => {
      return res.status(200).json({ totalDocs: count });
    })
   .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
})


server.post("/create-blog", verifyJWT, (req, res) => {
  let authorId = req.user;
  let { title, des, banner, content, tags, draft } = req.body;

  if (!title) {
    return res
      .status(403)
      .json({ error: "You must provide a title to publish the blog" });
  }

  if (!draft) {
    if (!des || des.length > 200) {
      return res.status(403).json({
        error: "You must provide a blog description under 200 characters",
      });
    }

    if (!banner) {
      return res
        .status(403)
        .json({ error: "You must provide a blog banner to publish it" });
    }

    if (
      !content ||
      !Array.isArray(content.blocks) ||
      content.blocks.length === 0
    ) {
      return res
        .status(403)
        .json({ error: "There must be some blog content to publish it" });
    }

    if (
      !tags ||
      !Array.isArray(tags) ||
      tags.length === 0 ||
      tags.length > 10
    ) {
      return res.status(403).json({
        error: "Provide tags in order to publish the blog, maximum 10",
      });
    }
  }

  tags = tags.map((tag) => tag.toLowerCase());

  let blog_id =
    title
      .replace(/[^a-zA-Z0-9]/g, " ")
      .replace(/\s+/g, "-")
      .trim() + nanoid();

  let blog = new Blog({
    title,
    des,
    banner,
    content,
    tags,
    author: authorId,
    blog_id,
    draft: Boolean(draft),
  });

  blog
    .save()
    .then((blog) => {
      let incrementVal = draft ? 0 : 1;
      User.findOneAndUpdate(
        { _id: authorId },
        {
          $inc: { "account_info.total_posts": incrementVal },
          $push: { blogs: blog._id },
        }
      )
        .then((user) => {
          return res.status(200).json({ id: blog.blog_id });
        })
        .catch((err) => {
          return res
            .status(500)
            .json({ error: "Failed to update total posts" });
        });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});
server.post("/search-blogs-count", (req, res) => {
  const { tag, query } = req.body;

  // Ensure tag is a string and trim it to avoid unnecessary whitespace
  const sanitizedTag = tag?.trim();

  // Define the base query for counting documents
  let findQuery = { draft: false };

  if (sanitizedTag) {
    findQuery.tags = sanitizedTag;
  } else if (query) {
    findQuery.title = new RegExp(query, 'i');
  }

  Blog.countDocuments(findQuery)
    .then(count => res.status(200).json({ totalDocs: count }))
    .catch(err => res.status(500).json({ error: err.message }));
});

server.post("/search-users", (req, res) => {
  let { query } = req.body;

  User.find({ "personal_info.username": new RegExp(query, 'i') })
    .limit(50)
    .select("personal_info.profile_img personal_info.username personal_info.fullname -_id")
    .then((users) => {
      return res.status(200).json({ users });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

server.post("/get-profile", (req, res)=> {
  let { username } = req.body;  
  User.findOne({ "personal_info.username": username })
  .select("-personal_info.password -google_auth -updateAt -blogs")
  .then(user => {
    return res.status(200).json(user);  
  })
  .catch(err => {
    return res.status(500).json({ error: err.message });  
  })
});


server.post("/search-blogs", (req, res) => {
  let { tag, query, page = 1 } = req.body;

  tag = tag?.trim();
  query = query?.trim();

  let findQuery = { draft: false };

  if (tag) {
    findQuery.tags = tag;
  } else if (query) {
    findQuery.title = new RegExp(query, 'i');
  }

  const maxLimit = 2;

  Blog.find(findQuery)
    .populate('author', 'personal_info.profile_img personal_info.username personal_info.fullname -_id')
    .sort({ publishedAt: -1 })
    .select('blog_id title des banner activity tags publishedAt -_id')
    .skip((page - 1) * maxLimit)
    .limit(maxLimit)
    .then(blogs => {
      res.status(200).json({ blogs });
    })
    .catch(err => {
      res.status(500).json({ err: err.message });
    });
});


server.get("/trending-blogs", (req, res) => {
  Blog.find({ draft: false })
  .populate('author', 'personal_info.profile_img personal_info.username personal_info.fullname -_id')
  .sort({ 'activity.total_read' : -1, 'activity.total_likes' : -1, 'activity.total_comments' : -1 , 'publishedAt' : -1 })
  .select('blog_id title publishedAt -_id')
  .limit(5)
  .then(blogs => {
    return res.status(200).json({ blogs: blogs });
  }).catch(err => {
    return res.status(500).json({err: err.message });
  })
})

server.get("/", (req, res) => {
  res.send("OK...my message");
});

connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
});
