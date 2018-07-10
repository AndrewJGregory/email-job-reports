const { CREDS, STUDENTS } = require("./creds");
const puppeteer = require("puppeteer");
const fs = require("fs");

async function main() {
  let browser = await puppeteer.launch({ headless: false, devTools: true });
  let page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1000 });
  await login(page);
  await page.goto("https://progress.appacademy.io/jobberwocky");
  await writeIds(page);
  writeToFile(STUDENTS);
}

async function writeIds(page) {
  let id;
  for (let i = 0; i < STUDENTS.length; i++) {
    await page.click("input[placeholder]");
    await page.keyboard.type(STUDENTS[i]["name"], { delay: 100 });
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle0" }),
      page.keyboard.press("Enter")
    ]);
    id = page.url().match(/\d+/)[0];
    STUDENTS[i]["id"] = id;
  }
}

async function login(page) {
  await page.goto("https://progress.appacademy.io/instructors/sign_in");
  await page.click("#instructor_email");
  await page.keyboard.type(CREDS["email"]);

  await page.click("#instructor_password");
  await page.keyboard.type(CREDS["password"]);

  await Promise.all([page.waitForNavigation(), page.click("button")]);
}

function writeToFile(obj) {
  fs.writeFile("./studentsWithIds.js", JSON.stringify(obj), function(err) {
    if (err) console.log(err);
  });
}

main();