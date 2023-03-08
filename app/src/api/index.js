const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { options } = require("../server/app");

class Poll {
  constructor({ question, options }) {
    this.id = uuidv4(); // Generate a new unique id for each poll
    this.question = question;
    this.options = options;
  }
}

class Presentation {
  constructor({polls}) {
    this.id = uuidv4(); // Generate a new unique id for the presentation
    this.polls = polls.map(poll => new Poll(poll));
    this.currentPollIndex = 0;
  }

  getCurrentPoll() {
    return this.polls[this.currentPollIndex];
  }

  getNextPoll() {
    this.currentPollIndex++;
    return this.getCurrentPoll();
  }
}

router.get("/ping", (req, res) => {
  res.send({
    result: "pong"
  })
})

let presentations = []

router.post('/presentations', (req, res) =>{
  var polls = req.body.polls;
  if (!req.body || !req.body.polls || req.body.polls.length === 0) {
    res.status(400).send('Invalid request body');
    return;
  }
  let pres = new Presentation({polls});
  presentations.push(pres);
  console.log(pres.id)

  res.status(200).json({
    presentation_id: pres.id 
  })
});

router.put('/presentations/:presentation_id/polls/current', (req, res) => {

  var presentationId = req.params.presentation_id;
  var presentation = presentations.find(p => p.id === presentationId);
  console.log(presentation)

  if (!presentation) {
    res.status(404).send('Presentation not found');
    return;
  }

  var new_current_poll = presentation.getNextPoll();

  res.status(200).json({
    poll_id: new_current_poll.id,
    question: new_current_poll.question,
    options: new_current_poll.options
  });
});


router.get('/presentations/:presentation_id/polls/current', (req, res) =>{
  
  var presentationId = req.params.presentation_id;
  var presentation = presentations.find(p => p.id === presentationId);
  var current_poll = presentation.getCurrentPoll();

  res.status(200).json({
    poll_id: current_poll.id,
    question: current_poll.question,
    options: current_poll.options
  });

});

module.exports = router;
