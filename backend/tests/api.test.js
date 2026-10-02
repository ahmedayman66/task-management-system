const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Board = require('../src/models/Board');
const List = require('../src/models/List');
const Task = require('../src/models/Task');

const TEST_DB_URI = process.env.MONGODB_URI_TEST || 'mongodb://127.0.0.1:27017/task_management_test';

beforeAll(async () => {
  await mongoose.connect(TEST_DB_URI);
  await User.deleteMany({});
  await Board.deleteMany({});
  await List.deleteMany({});
  await Task.deleteMany({});
});

afterAll(async () => {
  await User.deleteMany({});
  await Board.deleteMany({});
  await List.deleteMany({});
  await Task.deleteMany({});
  await mongoose.connection.close();
});

describe('Full Task Management System API Tests', () => {
  let user1Token;
  let user1Id;
  let user2Token;
  let user2Id;
  let createdBoardId;
  let createdListId;
  let createdTaskId;

  // 1. AUTHENTICATION TESTS
  describe('Authentication Endpoints', () => {
    it('should register a new user successfully (201)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Ahmed Test',
          email: 'ahmed@test.com',
          password: 'Password123'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe('ahmed@test.com');
      expect(res.body.data.user.password).toBeUndefined(); // Never return password!
      expect(res.body.data.token).toBeDefined();

      user1Token = res.body.data.token;
      user1Id = res.body.data.user._id;
    });

    it('should reject registration with duplicate email (409)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Ahmed Duplicate',
          email: 'ahmed@test.com',
          password: 'AnotherPassword123'
        });

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('EMAIL_EXISTS');
    });

    it('should login an existing user with valid credentials (200)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'ahmed@test.com',
          password: 'Password123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('ahmed@test.com');
    });

    it('should reject login with invalid password (401)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'ahmed@test.com',
          password: 'WrongPassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should reject unauthenticated request on protected route /api/auth/me (401)', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return current user for valid token on /api/auth/me (200)', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('ahmed@test.com');
    });

    // Create a second user for authorization tests
    it('should register a second user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Sarah Member',
          email: 'sarah@test.com',
          password: 'Password123'
        });

      expect(res.statusCode).toBe(201);
      user2Token = res.body.data.token;
      user2Id = res.body.data.user._id;
    });
  });

  // 2. BOARD TESTS
  describe('Board Endpoints', () => {
    it('should allow authenticated user to create a board (201)', async () => {
      const res = await request(app)
        .post('/api/boards')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'Project Roadmap',
          description: 'Main product roadmap board'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.board.title).toBe('Project Roadmap');
      expect(res.body.data.board.owner._id.toString()).toBe(user1Id.toString());

      createdBoardId = res.body.data.board._id;
    });

    it('should allow owner to update board (200)', async () => {
      const res = await request(app)
        .patch(`/api/boards/${createdBoardId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'Updated Project Roadmap'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.board.title).toBe('Updated Project Roadmap');
    });

    it('should prevent non-member from accessing the board (403)', async () => {
      const res = await request(app)
        .get(`/api/boards/${createdBoardId}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should allow adding user2 as a member (200)', async () => {
      const res = await request(app)
        .post(`/api/boards/${createdBoardId}/members`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          userId: user2Id
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.board.members.some((m) => m._id.toString() === user2Id.toString())).toBe(true);
    });

    it('should now allow user2 to view the board (200)', async () => {
      const res = await request(app)
        .get(`/api/boards/${createdBoardId}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.board._id.toString()).toBe(createdBoardId.toString());
    });

    it('should prevent user2 (non-owner) from deleting or renaming board (403)', async () => {
      const res = await request(app)
        .delete(`/api/boards/${createdBoardId}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.statusCode).toBe(403);
    });
  });

  // 3. LIST TESTS
  describe('List Endpoints', () => {
    it('should allow board member to create a list (201)', async () => {
      const res = await request(app)
        .post(`/api/boards/${createdBoardId}/lists`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'To Do',
          position: 1000
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.list.title).toBe('To Do');
      expect(res.body.data.list.board.toString()).toBe(createdBoardId.toString());

      createdListId = res.body.data.list._id;
    });

    it('should create a second list (In Progress)', async () => {
      const res = await request(app)
        .post(`/api/boards/${createdBoardId}/lists`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'In Progress',
          position: 2000
        });

      expect(res.statusCode).toBe(201);
    });

    it('should retrieve all lists for the board (200)', async () => {
      const res = await request(app)
        .get(`/api/boards/${createdBoardId}/lists`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.lists.length).toBe(2);
    });

    it('should allow updating a list title (200)', async () => {
      const res = await request(app)
        .patch(`/api/lists/${createdListId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'Backlog & To Do'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.list.title).toBe('Backlog & To Do');
    });
  });

  // 4. TASK TESTS
  describe('Task Endpoints', () => {
    it('should allow authorized user to create a task (201)', async () => {
      const res = await request(app)
        .post(`/api/lists/${createdListId}/tasks`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'Setup MongoDB connection',
          description: 'Configure Mongoose and connection string',
          priority: 'high',
          status: 'todo',
          assignedTo: user2Id,
          dueDate: new Date(Date.now() + 86400000).toISOString()
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.task.title).toBe('Setup MongoDB connection');
      expect(res.body.data.task.priority).toBe('high');
      expect(res.body.data.task.assignedTo._id.toString()).toBe(user2Id.toString());

      createdTaskId = res.body.data.task._id;
    });

    it('should reject assigning task to a non-board member (400)', async () => {
      // Create user 3 who is NOT a member of createdBoardId
      const u3 = await User.create({
        name: 'Strangely Outside',
        email: 'stranger@test.com',
        password: 'Password123'
      });

      const res = await request(app)
        .post(`/api/lists/${createdListId}/tasks`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'Invalid Assignment Task',
          assignedTo: u3._id
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error.code).toBe('USER_NOT_BOARD_MEMBER');
    });

    it('should update task status via dedicated endpoint (200)', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${createdTaskId}/status`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          status: 'in_progress'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.task.status).toBe('in_progress');
    });

    it('should reject invalid task status (400)', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${createdTaskId}/status`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          status: 'non_existent_status'
        });

      expect(res.statusCode).toBe(400);
    });

    it('should reassign task via dedicated endpoint (200)', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${createdTaskId}/assign`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          userId: user1Id
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.task.assignedTo._id.toString()).toBe(user1Id.toString());
    });
  });

  // 5. FILTERING AND PAGINATION TESTS
  describe('Filtering and Pagination', () => {
    beforeAll(async () => {
      // Add extra tasks for pagination and filtering tests
      await Task.create([
        {
          title: 'Documentation task 1',
          list: createdListId,
          board: createdBoardId,
          createdBy: user1Id,
          status: 'todo',
          priority: 'low'
        },
        {
          title: 'Documentation task 2',
          list: createdListId,
          board: createdBoardId,
          createdBy: user1Id,
          status: 'done',
          priority: 'high'
        },
        {
          title: 'Frontend task 1',
          list: createdListId,
          board: createdBoardId,
          createdBy: user1Id,
          status: 'in_progress',
          priority: 'high'
        }
      ]);
    });

    it('should filter tasks by status (200)', async () => {
      const res = await request(app)
        .get('/api/tasks?status=in_progress')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.every((t) => t.status === 'in_progress')).toBe(true);
    });

    it('should filter tasks by priority (200)', async () => {
      const res = await request(app)
        .get('/api/tasks?priority=high')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.every((t) => t.priority === 'high')).toBe(true);
    });

    it('should paginate tasks with correct metadata (200)', async () => {
      const res = await request(app)
        .get('/api/tasks?page=1&limit=2')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(2);
      expect(res.body.pagination.total).toBeGreaterThanOrEqual(4);
      expect(res.body.pagination.totalPages).toBeGreaterThanOrEqual(2);
    });
  });
});
