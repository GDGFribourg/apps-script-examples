function fib(x) {
  let f0 = 0
  let f1 = 1
  for (let i = 0; i < x; i++) {
    [f0, f1] = [f1, f0 + f1]
  }
  return f0
}