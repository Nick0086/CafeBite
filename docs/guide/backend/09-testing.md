# 09 - Testing

> Test structure, patterns, and checklist for backend API testing.

---

## Test Setup

**Framework**: Jest (configured in `package.json`)

```json
{
  "scripts": {
    "test": "jest"
  },
  "devDependencies": {
    "jest": "^29.7.0"
  }
}
```

---

## Test Structure

```
backend/
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   │   ├── category.service.test.js
│   │   │   └── auth.service.test.js
│   │   └── repositories/
│   │       └── category.repository.test.js
│   ├── integration/
│   │   ├── category.test.js
│   │   ├── auth.test.js
│   │   └── menu-item.test.js
│   └── e2e/
│       └── full-flow.test.js
```

---

## Integration Test Pattern

### Template

```javascript
import request from 'supertest';
import app from '../../app.js';

describe('POST /v1/category', () => {
    let accessToken;
    let categoryId;

    beforeAll(async () => {
        // Login and get token
        const loginRes = await request(app)
            .post('/v1/auth/user/verify-password')
            .send({ loginId: 'test@example.com', loginType: 'EMAIL', password: 'password' });

        accessToken = loginRes.body.sessionId.accessToken;
    });

    it('should create a category', async () => {
        const res = await request(app)
            .post('/v1/category')
            .set('Authorization', accessToken)
            .send({ name: 'Test Category' });

        expect(res.status).toBe(201);
        expect(res.body.status).toBe('success');
        expect(res.body.data.categoryId).toBeDefined();

        categoryId = res.body.data.categoryId;
    });

    it('should fetch all categories', async () => {
        const res = await request(app)
            .get('/v1/category')
            .set('Authorization', accessToken);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.categories).toBeInstanceOf(Array);
    });

    it('should update a category', async () => {
        const res = await request(app)
            .put(`/v1/category/${categoryId}`)
            .set('Authorization', accessToken)
            .send({ name: 'Updated Category', status: 1 });

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('success');
    });

    afterAll(async () => {
        // Cleanup
    });
});
```

---

## Testing Checklist

### GET Endpoints

- [ ] Valid request → 200 + data
- [ ] Invalid ID → 404
- [ ] Without auth → 401
- [ ] With expired token → 401
- [ ] Response format matches expected shape

### POST Endpoints

- [ ] Valid data → 201 + created resource
- [ ] Missing required fields → 400
- [ ] Invalid field values → 400
- [ ] Duplicate resource → 400
- [ ] Without auth → 401
- [ ] Response includes created ID

### PUT Endpoints

- [ ] Valid update → 200 + success
- [ ] Non-existent resource → 404
- [ ] Invalid data → 400
- [ ] Without auth → 401
- [ ] Wrong owner → 403/404

### DELETE Endpoints

- [ ] Valid delete → 200 + success
- [ ] Non-existent resource → 404
- [ ] Without auth → 401

---

## Unit Test Pattern

### Service Test

```javascript
import * as categoryService from '../../../src/modules/category/category.service.js';
import * as categoryRepository from '../../../src/modules/category/category.repository.js';

jest.mock('../../../src/modules/category/category.repository.js');

describe('categoryService.createCategory', () => {
    it('should create category successfully', async () => {
        categoryRepository.findCategoryByName.mockResolvedValue([{ total: 0 }]);
        categoryRepository.countCategories.mockResolvedValue([{ total: 5 }]);
        categoryRepository.createCategory.mockResolvedValue({ affectedRows: 1 });

        const result = await categoryService.createCategory('CLI_123', 'Test');

        expect(result.status).toBe('success');
        expect(result.data.categoryId).toBeDefined();
    });

    it('should throw if category already exists', async () => {
        categoryRepository.findCategoryByName.mockResolvedValue([{ total: 1 }]);

        await expect(categoryService.createCategory('CLI_123', 'Test'))
            .rejects.toThrow('Category Test already exists');
    });
});
```

---

## Running Tests

```bash
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- --coverage     # With coverage
npm test -- tests/integration/category.test.js  # Single file
```

---

## Test Data

### Use Test-Specific Database

```env
# .env.test
DB_NAME=cafebite_test
DB_HOST=localhost
DB_USER=test
DB_PASSWORD=test
```

### Seed Test Data

```javascript
beforeAll(async () => {
    await query('INSERT INTO clients (unique_id, email, password) VALUES (?, ?, ?)',
        ['TEST_CLI', 'test@example.com', hashedPassword]);
});

afterAll(async () => {
    await query('DELETE FROM clients WHERE unique_id = ?', ['TEST_CLI']);
});
```

---

## Mocking Patterns

### Mock Repository

```javascript
jest.mock('../../../src/modules/category/category.repository.js');

categoryRepository.findAllCategories.mockResolvedValue([
    { unique_id: 'CAT_1', name: 'Starters', status: 1 }
]);
```

### Mock Provider

```javascript
jest.mock('../../../src/providers/minio/minio.provider.js');

minioProvider.uploadObject.mockResolvedValue({ key: 'test-key' });
minioProvider.getSignedUrl.mockResolvedValue('https://signed-url.com/test');
```

### Mock External Service

```javascript
jest.mock('../../../src/providers/nodemailer/nodemailer.provider.js');

nodemailerProvider.sendOtpEmail.mockResolvedValue(true);
```

---

## E2E Test Pattern

```javascript
describe('Full Category Flow', () => {
    it('should login, create category, fetch, update, and delete', async () => {
        // 1. Login
        const loginRes = await request(app)
            .post('/v1/auth/user/verify-password')
            .send({ loginId: 'test@example.com', loginType: 'EMAIL', password: 'password' });
        expect(loginRes.status).toBe(200);
        const token = loginRes.body.sessionId.accessToken;

        // 2. Create category
        const createRes = await request(app)
            .post('/v1/category')
            .set('Authorization', token)
            .send({ name: 'E2E Category' });
        expect(createRes.status).toBe(201);
        const categoryId = createRes.body.data.categoryId;

        // 3. Fetch all
        const fetchRes = await request(app)
            .get('/v1/category')
            .set('Authorization', token);
        expect(fetchRes.status).toBe(200);
        expect(fetchRes.body.categories.length).toBeGreaterThan(0);

        // 4. Update
        const updateRes = await request(app)
            .put(`/v1/category/${categoryId}`)
            .set('Authorization', token)
            .send({ name: 'Updated E2E Category', status: 1 });
        expect(updateRes.status).toBe(200);

        // 5. Verify update
        const verifyRes = await request(app)
            .get('/v1/category')
            .set('Authorization', token);
        const updated = verifyRes.body.categories.find(c => c.unique_id === categoryId);
        expect(updated.name).toBe('Updated E2E Category');
    });
});
```
