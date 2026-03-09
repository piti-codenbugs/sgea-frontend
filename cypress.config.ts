import { defineConfig } from "cypress";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

export default defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || "http://localhost:3000",

    setupNodeEvents(on, config) {
      // implement node event listeners here
      config.env.STUDENT_EMAIL = process.env.CYPRESS_STUDENT_EMAIL
      config.env.STUDENT_PASSWORD = process.env.CYPRESS_STUDENT_PASSWORD

      config.env.PROFESSOR_EMAIL = process.env.CYPRESS_PROFESSOR_EMAIL
      config.env.PROFESSOR_PASSWORD = process.env.CYPRESS_PROFESSOR_PASSWORD

      return config
    },
  },
});
