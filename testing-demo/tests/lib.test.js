const lib = require('../lib');
const db = require('../db');
const mail = require('../mail');

// 测试用例的数量应 >= 代码的运行路径

/**
 * 测试数字
 */
// test('absolute - should return a positive number if input is positive', () => {
//   // 注意测试的数字应尽量普通，使用像857这样的魔法值，可能会让人困惑这个值是否有特殊含义
//   const result = lib.absolute(1);
//   expect(result).toBe(1);
// });

// test('absolute - should return a positive number if input is negative', () => {
//   const result = lib.absolute(-1);
//   expect(result).toBe(1);
// });

// test('absolute - should return a zero if input is zero', () => {
//   const result = lib.absolute(0);
//   expect(result).toBe(1);
// })

// 使用describe函数，将测试用例分组
describe('absolute', () => {
  // it 等同 test, 但是更加语义化
  it('should return a positive number if input is positive', () => {
    // 注意测试的数字应尽量普通，使用像857这样的魔法值，可能会让人困惑这个值是否有特殊含义
    const result = lib.absolute(1);
    expect(result).toBe(1);
  });

  it('should return a positive number if input is negative', () => {
    const result = lib.absolute(-1);
    expect(result).toBe(1);
  });

  it('should return a zero if input is zero', () => {
    const result = lib.absolute(0);
    expect(result).toBe(0);
  })
})


/**
 * 测试字符串
 */
describe('greet', () => {
  it('should return the greeting message', () => {
    const result = lib.greet('Camille');

    /**
     * 注意：测试字符串时，不希望测试条件太苛刻，这会导致源代码的一小点改动，都会触发测试失败
     */
    // expect(result).toBe('Welcome Camille'); // 这时候如果源代码改成return 'Welcome ' + name + '!'; 就会测试失败

    // 使用正则表达式 或者 toContain，更加灵活
    expect(result).toMatch(/Camille/); // 使用正则表达式，更加灵活
    // expect(result).toContain('Camille');
  });
});


/**
 * 测试数组
 */
describe('getCurrencies', () => {
  it('should return an array containing three currencies', () => {
    const result = lib.getCurrencies();

    // 太宽泛的测试用例
    expect(result).toBeDefined(); // 不是很有意义，如果此时函数返回1, 也会通过测试

    // 太具体的测试用例, 强调了顺序和结果长度
    expect(result.length).toBe(3);
    expect(result[0]).toBe('USD');
    expect(result[1]).toBe('AUD');
    expect(result[2]).toBe('EUR');

    // 更加灵活的测试用例
    expect(result).toContain('USD');
    expect(result).toContain('AUD');
    expect(result).toContain('EUR');

    // 简单一点的写法，与上面的写法等价
    expect(result).toEqual(expect.arrayContaining(['USD', 'AUD', 'EUR']));
  });
})


/** 
 * 测试对象
 */
describe('getProduct', () => {
  const result = lib.getProduct(1);
  it('should return the product with the given id', () => {
    
    // 注意，匹配对象时不要用toBe，因为toBe比较的是引用，而不是值
    // expect(result).toBe({ id: 1, price: 10 }); // 测试失败

    // 使用toEqual，要求对象所有属性都要列举
    expect (result).toEqual({ id: 1, price: 10 });

    // 使用toMatchObject，只要求对象包含指定的属性即可
    expect(result).toMatchObject({ id: 1, price: 10 }); // 测试假如源对象有多余属性，也会通过

    // 使用toHaveProperty，只要求对象包含指定的属性即可
    expect(result).toHaveProperty('id', 1);
  })
})


/**
 * 测试异常
 */
describe('registerUser', () => {
  it('should throw if user is falsy', () => {
    const args = [null, undefined, NaN, '', 0, false];
    // 测试抛出异常
    args.forEach(a => {
      // 注意，这里不能用返回值判断const result = lib.registerUser(a)，因为抛出异常并不会返回东西，需要直接调用函数
      expect(() => { lib.registerUser(a) }).toThrow();
    })
  });

  it('should return a user object if a valid user is passed', () => {
    const result = lib.registerUser('Camille');
    expect(result).toMatchObject({ username: 'Camille' });
    // 源代码中id为当前时间，但用例定义时和用例调用时不可能一致，所以用大于0来判断
    expect(result.id).toBeGreaterThan(0);
  })
})



/**
 * 使用mock函数，替换需要依赖外部（例如数据库等）真实的函数
 */
describe('applyDiscount', () => {
  it('should apply 10% discount if customer has more than 10 points', () => {
    /**
     * 使用mock函数，替换db.getCustomerSync (记得先引入db)
     * 
     * 注意，在node中，通过require引入的模块是单例的（在内存中只有一个实例），
     * 所以这里直接修改db.getCustomerSync，能影响lib.applyDiscount中的db.getCustomerSync
     * 
     */ 
    db.getCustomerSync = (id) => {
      console.log('Fake reading customer...');
      return { id: id, points: 20 }
    }

    const order = { customerId: 1, totalPrice: 10 };
    lib.applyDiscount(order);
    expect(order.totalPrice).toBe(9);
  });
})



/**
 * 测试模块交互
 * 
 * 使用flag来判断是否调用了某个函数
 */
describe('notifyCustomer', () => {
  it('should send an email to the customer', () => {
    // 使用flag来判断是否调用了某个函数
    db.getCustomerSync = (id) => {
      return { id: id, points: 20, email: 'a' }
    }

    // 由于单测中，我们更关心mail.send是否被调用（notifyCustomer 与 mail 的交互），而不是邮件是否发送成功，或者邮件的内容是否正确，所以这里用flag来代替mail.send的实现
    let mailSent = false;
    mail.send = (email, message) => {
      mailSent = true;
    }

    lib.notifyCustomer({ customerId: 1 });
    expect(mailSent).toBe(true);
  })
})

// 使用jest.mock来实现mock函数
describe('notifyCustomer mock', () => {
  it('should send an email to the customer', () => {
    db.getCustomerSync = jest.fn().mockReturnValue({ id: 1, points: 20, email: 'a' });
    mail.send = jest.fn();

    lib.notifyCustomer({ customerId: 1 });

    expect(mail.send).toHaveBeenCalled();

    // 如果想要测试的函数需要参数调用，验证模拟函数（mock function）是否被调用，并且调用时的参数是否符合预期，可以使用toHaveBeenCalledWith
    expect(mail.send).toHaveBeenCalledWith('a', expect.stringContaining('order'));


    // 但由于我们希望测试字符串时，能够更加灵活，所以使用下面的写法，效果和toHaveBeenCalledWith一样
    // 可以通过函数的mock.calls属性来查看函数被调用的次数，以及调用时的参数
    // calls[0]表示第一次调用，calls[0][0]表示第一次调用时的第一个参数
    expect(mail.send.mock.calls[0][0]).toBe('a');
    expect(mail.send.mock.calls[0][1]).toMatch(/order/);
  })
})