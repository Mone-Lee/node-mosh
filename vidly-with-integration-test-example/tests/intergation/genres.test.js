// supertest库就像postman一样，可以发送http请求
const request = require('supertest');

const { Genre } = require('../../models/genre');
const { User } = require('../../models/user');

// 本来默认引入app对象，但是当修改源代码时，jest自动重新运行测试，会导致app对象重复监听3000端口，所以需要在测试用例中控制app对象
// const server = require('../../index');
let server;

describe('GET /api/genres', () => {
  // 在测试容器（'GET /api/genres'）的每个测试用例之前和之后都要启动和关闭服务器
  beforeEach(() => {
    server = require('../../index');
  })
  afterEach(async () => {
    server.close();
    await Genre.remove({}); // 清空测试数据
  })

  describe('GET /', () => {
    it('should return all genres', async () => {
      // 批量插入测试数据到数据库
      await Genre.collection.insertMany([
        { name: 'genre1' },   // 注意这里会进行实际数据的条件检测，如值的字符长度限制，不要使用随便的值，如'a'
        { name: 'genre2' }
      ]); 

      const res = await request(app).get('/api/genres');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(g => g.name === 'genre1')).toBeTruthy();
      expect(res.body.some(g => g.name === 'genre2')).toBeTruthy();
    });
  });

  describe('GET /:id', () => {
    it('should return a genre if the id is valid', async () => {
      const genre = new Genre({ name: 'genre1' });
      await genre.save();

      const res = await request(app).get('/api/genres/' + genre._id);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', genre.name);

      // 注意不要用这种匹对，因为genre的_id是一个对象，但res.body中的_id是字符串
      // expect(res.body).toMatchObject(genre);
    });

    it('should return 404 if the id is invalid', async () => {
      const res = await request(app).get('/api/genres/1');

      expect(res.status).toBe(404);
    })
  })

  describe('POST /', () => {
    it('should return status 401 if client is not logged in', async () => {
      const res = await request(server).post('/api/genres').send({ name: 'genre1' });

      expect(res.status).toBe(401);
    });

    it('should return status 400 if genre is less than 5 characters', async () => {
      const token = new User().generateAuthToken();
      const res = await request(server).post('/api/genres').set('x-auth-token', token).send({ name: '1234' });

      expect(res.status).toBe(400);
    });

    it('should return status 400 if genre is more than 50 characters', async () => {
      const token = new User().generateAuthToken();
      const name = new Array(52).join('a');
      const res = await request(server).post('/api/genres').set('x-auth-token', token).send({ name: name });

      expect(res.status).toBe(400);
    });

    it('should save the genre if it is valid', async () => {
      const token = new User().generateAuthToken();

      await request(server).post('/api/genres').set('x-auth-token', token).send({ name: 'genre1' });

      const genre = await Genre.find({name: 'genre1'});

      expect(genre).not.toBeNull();
    })

    it('should return the genre if it is valid', async () => {
      const token = new User().generateAuthToken();

      const res = await request(server).post('/api/genres').set('x-auth-token', token).send({ name: 'genre1' });

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', 'genre1');
    })
  });
});