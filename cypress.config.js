const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://nova.uniautonoma.edu.co",
    video: true,
    screenshotOnRunFailure: true,
  },
});
