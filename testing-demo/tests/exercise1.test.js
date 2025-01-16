const { fizzBuzz } = require('../exercise1')

describe('fizzBuzz', () => {
  it('should throw if input is not a number', () => {
    const args = [null, undefined, 'a', [], {}, false];

    args.forEach(arg => {
      expect(() => { fizzBuzz(arg) }).toThrow()
    })
  })

  it('should return "FizzBuzz" if input is divisible by 3 and 5', () => {
    const result = fizzBuzz(15)
    expect(result).toBe('FizzBuzz')
  })

  it('should return "Fizz" if input is divisible by 3 but cannot be divided by 5', () => {
    const result = fizzBuzz(9)
    expect(result).toBe('Fizz')
  })

  it('should return "Buzz" if input is divisible by 5 but cannot be divided by 3', () => {
    const result = fizzBuzz(10)
    expect(result).toBe('Buzz')
  })

  it('should return input if input is not divisible by 3 or 5', () => {
    const result = fizzBuzz(1)
    expect(result).toBe(1)
  })
})