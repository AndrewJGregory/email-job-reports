const { CREDS, STUDENTS } = require("./creds");
const puppeteer = require("puppeteer");

async function main() {
  let browser = await puppeteer.launch({ headless: false, devTools: true });
  let page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1000 });
  await login(page);
  await page.goto("https://progress.appacademy.io/jobberwocky");
}

async function login(page) {
  await page.goto("https://progress.appacademy.io/instructors/sign_in");
  await page.click("#instructor_email");
  await page.keyboard.type(CREDS["email"]);

  await page.click("#instructor_password");
  await page.keyboard.type(CREDS["password"]);

  await Promise.all([page.waitForNavigation(), page.click("button")]);
}

main();
