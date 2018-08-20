const { CREDS, STUDENTS } = require("./creds");
const puppeteer = require("puppeteer");
const fs = require("fs");
const { openEmailConnection, sendEmail } = require("./mail");

async function main() {
  let browser = await puppeteer.launch({ headless: false, devTools: true });
  let page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1000 });
  await login(page);
  for (let i = 0; i < STUDENTS.length; i++) {
    const id = STUDENTS[i]["id"];
    const url = `https://progress.appacademy.io/jobberwocky/students/${id}`;
    await page.goto(url);
    await page.waitForSelector(".student-show-apps");
    const numJobsApplied = await page.$$eval(
      ".student-show-apps",
      figures => figures[0].children[0].innerText.match(/\d+/)[0]
    );
    console.log(`numJobsApplied: ${numJobsApplied}`);
    STUDENTS[i]["jobsApplied"] = numJobsApplied;
  }
  sendEmail(STUDENTS, openEmailConnection());
}

async function writeIds(page) {
  let id;
  await page.goto("https://progress.appacademy.io/jobberwocky");
  for (let i = 0; i < STUDENTS.length; i++) {
    await page.click("input[placeholder]");
    await page.keyboard.type(STUDENTS[i]["name"], { delay: 100 });
    /* delay is necessary here because of the specific way that
     the input field works on jobberwocky: it auto-suggests names
     as one types, if the name is typed instantly with no delay then
     the wrong name is selected more often than not. A delay makes
     the typing more human-like */
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle0" }),
      page.keyboard.press("Enter")
    ]);
    id = page.url().match(/\d+/)[0];
    console.log(`NAME: ${STUDENTS[i]["name"]}, ID: ${id}`);
    STUDENTS[i]["id"] = id;
  }
}

async function login(page) {
  await page.goto("https://progress.appacademy.io/instructors/sign_in");
  await page.click("#instructor_email");
  await page.keyboard.type(CREDS["jobberWocky"]["email"]);

  await page.click("#instructor_password");
  await page.keyboard.type(CREDS["jobberWocky"]["password"]);

  await Promise.all([page.waitForNavigation(), page.click("button")]);
}

function writeToFile(obj) {
  fs.writeFile("./writtenFile.js", JSON.stringify(obj), function(err) {
    if (err) console.log(err);
  });
}

main();
