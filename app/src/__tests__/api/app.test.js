const app = require("../../server/app");
const supertest = require("supertest");


test("GET /ping", async () => {
  await supertest(app).get("/ping")
      .expect(200)
      .then((response) => {
        // Check data
        expect(response.body.result).toBe("pong");
      });
});

describe('POST /presentations', () => {
  it('should return a 400 status code when creating a presentation with no polls', async () => {
    const response = await supertest(app)
      .post('/presentations')
      .send({});
    expect(response.statusCode).toBe(400);
  });
});

describe('GET /presentations/:presentation_id/polls', () => {
  it('should return a 404 status code when requesting a non-existent presentation', async () => {
    const response = await supertest(app)
      .get('/presentations/unknown_presentation_id/polls')
      .set('Content-Type', 'application/json');
    expect(response.statusCode).toBe(404);
  });
});

describe('Interactive Presentation API', () => {
  let presentationId, pollId;

  test('creating a presentation and showing a poll', async () => {
    const res1 = await supertest(app)
      .post('/presentations')
      .send({
        polls: [
          {
            question: "What's your favorite pet?",
            options: [
              {key: "A", value: "Dog"},
              {key: "B", value: "Cat"},
              {key: "C", value: "Crocodile"}
            ]
          },
          {
            question: "Which of the countries would you like to visit the most?",
            options: [
              {key: "A", value: "Argentina"},
              {key: "B", value: "Austria"},
              {key: "C", value: "Australia"}
            ]
          }
        ]
      })

      console.log(res1.body.presentation_id)
    expect(res1.body.presentation_id).toBeDefined();
    presentationId = res1.body.presentation_id;
    
  

     const res2 = await supertest(app)
      .put(`/presentations/${presentationId}/polls/current`)
      .expect(200);

    expect(res2.body.poll_id).toBeDefined();
    expect(res2.body.question).toBe("Which of the countries would you like to visit the most?");
    expect(res2.body.votes).toBeUndefined();
    pollId = res2.body.poll_id; 

     const res3 = await supertest(app)
      .get(`/presentations/${presentationId}/polls/current`)
      .expect(200);

    expect(res3.body.poll_id).toBeDefined();
    expect(res3.body.question).toBe("Which of the countries would you like to visit the most?");
    expect(res3.body.votes).toBeUndefined(); 
  });
});