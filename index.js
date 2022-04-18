

const express = require('express')
const app = express()
const argv = require('minimist')(process.argv.slice(2))
const db = require("./src/services/database.js")
const fs = require('fs')
const morgan = require('morgan')

const HTTP_PORT = argv.port || process.env.PORT || 5555

// Add cors dependency
const cors = require('cors')
// Set up cors middleware on all endpoints
app.use(cors())

const help = (`
server.js [options]

--port	Set the port number for the server to listen on. Must be an integer
            between 1 and 65535.

--debug	If set to true, creates endlpoints /app/log/access/ which returns
            a JSON access log from the database and /app/error which throws 
            an error with the message "Error test successful." Defaults to 
            false.

--log		If set to false, no log files are written. Defaults to true.
            Logs are always written to database.

--help	Return this message and exit.
`)

const debug = argv.debug || false
const log = argv.log || true

// Serve static HTML files
app.use(express.static('./public'));

// Make Express use its own built-in body parser to handle JSON
app.use(express.json());

const server = app.listen(HTTP_PORT, () => {
    console.log('App lstening on port %PORT'.replace('%PORT',HTTP_PORT))
    console.log(argv)
});

if (argv.help || argv.h) {
  console.log(help)
  process.exit(0)
}

app.use( (req, res, next) => {
  let logdata = {
    remoteaddr: req.ip,
    remoteuser: req.user,
    time: Date.now(),
    method: req.method,
    url: req.url,
    protocol: req.protocol,
    httpversion: req.httpVersion,
    status: res.statusCode,
    referer: req.headers['referer'],
    useragent: req.headers['user-agent']
  }
  const stmt = db.prepare('INSERT INTO accesslog (remoteaddr, remoteuser, time, method, url, protocol, httpversion, status, referer, useragent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
  const info = stmt.run(logdata.remoteaddr, logdata.remoteuser, logdata.time, logdata.method, logdata.url, logdata.protocol, logdata.httpversion, logdata.status, logdata.referer, logdata.useragent)
  next();
})

app.get('/app/', (req, res) => {
    res.statusCode = 200;
    res.statusMessage = 'OK'
    res.writeHead(res.statusCode, { 'Content-Type' : 'text/plain' });
    res.end(res.statusCode+ ' ' +res.statusMessage)
});

app.post('/app/flip/coins/', (req, res, next) => {
    const number = req.body.number || 1

    const flips = new Array()
    for (var i = 0; i < number; i++) {
        flips.push(coinFlip())
    }

    //if (flips.length == 1) console.log(`{ ${flips.pop()}: 1 }`)
    res.json({raw: flips, summary:countFlips(flips)})
});

app.get('/app/flips/:number', (req, res) => {
  const number = req.params.number || 1

  const flips = new Array()
  for (var i = 0; i < number; i++) {
      flips.push(coinFlip())
  }

  //if (flips.length == 1) console.log(`{ ${flips.pop()}: 1 }`)
  res.json({raw: flips, summary:countFlips(flips)})
});

app.get('/app/flip/', (req, res) => {
    res.json({ flip: coinFlip() })
});

app.post('/app/flip/call/', (req, res) => {
    const call = req.body.guess
    if (call == "heads" || call == "tails") {
        res.json({call: flipACoin(call)})
    }else {
        res.status(500).json({ error: 'no input. \n Usage: node guess-flip --call=[heads|tails]' })
    }
});

app.get('/app/flip/call/:guess', (req, res) => {
  const call = req.params.guess
  if (call == "heads" || call == "tails") {
      res.json({call: flipACoin(call)})
  }else {
      res.status(500).json({ error: 'no input. \n Usage: node guess-flip --call=[heads|tails]' })
  }
});

if (debug != false) {

  app.get('/app/log/access', (req, res) => {
    try {
      const stmt = db.prepare('SELECT * FROM accesslog').all()
      res.status(200).json(stmt)
  } catch {
      console.error(e)
  }
  });

  app.get('/app/error', (req, res) => {
    throw new Error('Error test successful.')
  });


}

if (argv.log != 'false') {
  const WRITESTREAM = fs.createWriteStream('./data/log/access.log', { flags: 'a' })
  app.use(morgan('combined', { stream: WRITESTREAM }))
}

app.use(function(req, res){
  res.status(404).send('404 NOT FOUND')
});



  




function coinFlip() {
  return Math.random() > 0.5 ? ("heads") : ("tails")
}

function coinFlips(flips) {
const results = new Array()
for (var i = 0; i < flips; i++) {
  results.push(coinFlip())
}
return results
}

function countFlips(array) {
const nums = {
  heads: 0,
  tails: 0
}
for (var result in array) {
  array[result]== "heads" ? nums.heads += 1 : nums.tails += 1
}
return nums
}

function flipACoin(call) {
const flip_result = coinFlip()
const results = {
  call: call,
  flip: flip_result,
  result: call == flip_result ? "win" : "lose"
}
return results
}