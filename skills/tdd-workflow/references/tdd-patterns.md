# TDD Patterns & Mocking Reference

## 1. Arrange-Act-Assert (AAA)
Always structure tests cleanly into three discrete blocks:
```typescript
it('should calculate discount correctly', () => {
  // Arrange
  const cart = new Cart();
  cart.addItem({ price: 100 });

  // Act
  const total = cart.getDiscountedTotal(0.2);

  // Assert
  expect(total).toBe(80);
});
```

## 2. Mocking Boundaries
- Only mock at system boundaries (e.g. 3rd-party HTTP APIs, payment gateways, hardware).
- Avoid mocking internal domain services or utilities; test them through public contracts.
- In Python, use `unittest.mock.patch` with context managers.
- In Node/TypeScript, use `vi.spyOn` or `jest.spyOn`.
