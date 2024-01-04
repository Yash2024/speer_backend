
// const chai = require('chai');
import chai from 'chai';
import chaiHttp from 'chai-http';
const chaiHttp = require('chai-http');
const app = require('../app'); // Replace with the path to your Express app file
const mongoose = require('mongoose');

chai.use(chaiHttp);
const expect = chai.expect;

describe('API Endpoints', () => {
  before((done) => {
    // Connect to a test database before running tests
    mongoose.connect('mongodb+srv://node-shop:node-shop@cluster0.giegz.mongodb.net/speer?retryWrites=true&w=majority', () => {
      done();
    });
  });

  after((done) => {
    // Disconnect from the test database after running tests
    mongoose.connection.close(() => {
      done();
    });
  });

  describe('Authentication Endpoints', () => {
    it('should create a new user account', (done) => {
      chai.request(app)
        .post('/api/auth/signup')
        .send({ email: 'testusermail', password: 'testpassword' ,name:'testusername'})
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.property('message').eql('User created successfully');
          done();
        });
    });

    it('should log in to an existing user account and receive an access token', (done) => {
      chai.request(app)
        .post('/api/auth/login')
        .send({ email: 'testusermail', password: 'testpassword' })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.property('token');
          done();
        });
    });
  });

  describe('Note Endpoints', () => {
    let authToken;

    before((done) => {
      // Log in and get an access token for further testing
      chai.request(app)
        .post('/api/auth/login')
        .send({ email: 'testusermail', password: 'testpassword' })
        .end((err, res) => {
          authToken = res.body.token;
          done();
        });
    });


    beforeEach((done) => {
        // Create a test note before each test
        const testNote = new Note({
          noteid: '1',
          title: 'Test Note',
          content: 'This is a test note',
          email: 'testuser@test.com',
          sharedWith: [{ useremail: 'shareduser@test.com' }],
        });
    
        testNote.save((err, savedNote) => {
          noteId = savedNote._id;
          done();
        });
      });
    
      afterEach((done) => {
        // Remove the test note after each test
        Note.deleteMany({}, () => {
          done();
        });
      });
    
      it('should get a list of all notes for the authenticated user', (done) => {
        chai.request(app)
          .get('/api/notes')
          .send({ email: 'usermail'})
          .set('Authorization', `Bearer ${authToken}`)
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.a('array');
            done();
          });
      });
    
      it('should get a note by ID for the authenticated user', (done) => {
        chai.request(app)
          .get(`/api/notes/${noteId}`)
          .send({ email: 'usermail'})
          .set('Authorization', `Bearer ${authToken}`)
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.a('object');
            expect(res.body).to.have.property('title').eql('Test Note');
            done();
          });
      });
    
      it('should create a new note for the authenticated user', (done) => {
        chai.request(app)
          .post('/api/notes')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            noteid: '2',
            title: 'New Note',
            content: 'This is a new note',
            email: 'testuser@test.com',
            sharedWith: [{ useremail: 'shareduser@test.com' }],
          })
          .end((err, res) => {
            expect(res).to.have.status(201);
            expect(res.body).to.be.a('object');
            expect(res.body).to.have.property('message').eql('Note created successfully');
            done();
          });
      });
    
      it('should update an existing note by ID for the authenticated user', (done) => {
        chai.request(app)
          .put(`/api/notes/${noteId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ title: 'Updated Note' })
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.a('object');
            expect(res.body).to.have.property('message').eql('Note updated successfully');
            done();
          });
      });
    
      it('should delete a note by ID for the authenticated user', (done) => {
        chai.request(app)
          .delete(`/api/notes/${noteId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.a('object');
            expect(res.body).to.have.property('message').eql('Note deleted successfully');
            done();
          });
      });
    
      it('should share a note with another user for the authenticated user', (done) => {
        chai.request(app)
          .post(`/api/notes/${noteId}/share`)
          .send({ email: 'usermail of user yto be shared with'})
          .set('Authorization', `Bearer ${authToken}`)
          .send({ email: 'newuser@test.com' })
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.a('object');
            expect(res.body).to.have.property('message').eql('Note shared successfully');
            done();
          });
      });
    
      it('should search for notes based on keywords for the authenticated user', (done) => {
        chai.request(app)
          .get('/api/search?q=test')
          .send({ email: 'usermail'})
          .set('Authorization', `Bearer ${authToken}`)
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.a('array');
            done();
          });
      });
    
  });
});
