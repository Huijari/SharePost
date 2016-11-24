const mongo = require('mongodb');
const restify = require('restify');

const log = console.log.bind(console);
const connect = _ => {
  const url = 'mongodb://localhost:27017/lab';
  return mongo.MongoClient.connect(url);
};

const article = Object.create(null);
article.post = (req, res, next) => {
  if (!req.body.content) {
    res.send(400, 'Article without content');
  } else {
    connect()
      .then(db => {
        const collection = db.collection('article');
        collection.insertOne({
          content: req.body.content,
          timestamp: new Date()
        })
          .then(result => {
            res.send({
              id: result.ops[0]._id
            });
            db.close();
            next();
          })
          .catch(log);
      })
      .catch(log);
  }
};
article.get = (req, res, next) => {
  connect()
    .then(db => {
      const collection = db.collection('article');
      collection.findOne(mongo.ObjectId(req.params.id))
        .then(doc => {
          res.send(doc);
          db.close();
          next();
        })
        .catch(log);
    })
    .catch(log);
};

const server = restify.createServer();
server.use(restify.CORS());
server.use(restify.bodyParser());

server.post('/api/article', article.post);
server.get('/api/article/:id', article.get);

server.get(/.*/, restify.serveStatic({
  directory: 'static',
  default: 'index.html'
}));
server.listen(8080);
