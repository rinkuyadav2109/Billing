export default {
  test: {
    include: ["tests/default.test.js"],
    forceRerunTriggers: [
      '**/tests/fixtures/**',
      '**/src/**',
    ],
  },
};
