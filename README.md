## Introduction

After finishing [App Academy](https://www.appacademy.io/), our students start applying for jobs in software engineering. We (career coaches) guide and help our students navigate this process of applying for jobs. Every week we check in with our students and see how many jobs that they applied to the previous week. The process of seeing how many jobs that our students applied to has been rather tedious so I decided to automate it to save time and increase productivity.

### Technologies

- [puppeteer](https://github.com/GoogleChrome/puppeteer/), a headless Chrome node API to automate Chrome
- [nodemailer](https://github.com/nodemailer/nodemailer), to automatically send an email to each career coach with all of the student data

For a deeper dive into both of these technologies, check out my other more in-depth project [here](https://github.com/AndrewJGregory/scrape-mba-results).

### Previous Workflow

1.  Search for student on our internal website
2.  Click "Details" under "Applications"
3.  Count how many jobs have been applied in the last 7 days
4.  Repeat for every student

Using a random student as an example, this is what steps 2-3 would look like:

After searching for the student, this is the show page that displays:

![student show page](/images/student_show_page.png)

(name and picture are omitted)

Clicking on Details leads to this page:

![list of jobs](/images/list_of_jobs.png)

(company names are omitted)

Now we count each row if the "added" was less than 7 days ago. This gives the total amount of jobs that the student has applied to in the last week.

An astute reader may note that there is a "Weekly Applied" number in the first screenshot. This is the running total of jobs that the student has applied to for a given week. However, this number resets every Monday at 12:00AM. When we send out weekly check-in emails on Monday morning, then the Weekly Applied number has been reset to 0 and we have to follow the above workflow to ascertain how many jobs that the student has applied to over the last week.

### General Initial Approaches

Armed with my knowledge of puppeteer and nodemailer from my [previous project](https://github.com/AndrewJGregory/scrape-mba-results), I knew what technologies that I had to use from the beginning.

### Thought Process

There were two processes that I considered to compute the total amount of jobs applied to in the last week:

1.  Go through the above process every Monday morning with puppeteer by counting every row that is less than "7 days ago".
2.  Take advantage of the "Weekly Applied" and grab the number every Sunday night before it resets Monday at 12AM.

Between both of these, #2 sounded much easier. The only drawback to it is that if a student is applying to jobs Sunday night then I might miss some of these jobs if I run the program too early. Example: I run the program at 8PM on Sunday, which grabs all the "Weekly Applied" numbers. However, if a student applies to jobs after 8PM, then these jobs would not be included in my original report, which would now be inaccurate. However, if I run the program late enough (11:30PM), then this drawback is heavily mitigated.

### Current Workflow

#### Setup:

First, create a file, `creds.js`, that exports two different objects:

```javascript
const CREDS = {
  jobberWocky: {
    email: "agregory@appacademy.io",
    password: "xxx"
  },
  email: { address: "agregory@appacademy.io", password: "xxx" }
};

const STUDENTS = [{ name: "Andrew Gregory", careerCoach: "A", id: "9999" }];

module.exports = { CREDS, STUDENTS };
```

`jobberWocky` is the internal tool that we use to track student's progress. `email` is the email address that the email will be sent from.

Second, to allow `nodemailer` to automatically send email from your email address, log into your gmail account and go to its settings. Sign-in & security => Apps with account access => check "Allow less secure apps".

Third, be sure to have node installed and `npm i nodemailer puppeteer` in the repo directory.

If this is the first time that the program is run, then the `id`s of each student needs to be gathered. A separate function is provided for that in `main.js`. When all of the `id`s are gathered into the `STUDENTS` object, then the program will visit every student's page and grab the number from "Weekly Applied".

Then `cd` into the repo directory and run `node main.js`.

### Cool code snippet

All of the career coaches have different students assigned to them. To make it easier for all of us, I decided to sort the number of jobs each of our students have applied to. In this way we can know how everybody is doing while focusing on our own students in particular. **'a', 'j', and 'd' are all the first letters of the first name of a coach.** Given that `STUDENTS` object, I take advantage of pass by reference to DRY up my code:

```js
const sortStudents = students => {
  const jStudents = students.filter(student => student["careerCoach"] === "J");
  const dStudents = students.filter(student => student["careerCoach"] === "D");
  const aStudents = students.filter(student => student["careerCoach"] === "A");
  const allStudents = [aStudents, dStudents, jStudents];
  for (let i = 0; i < 3; i++) {
    allStudents[i].sort((s1, s2) =>
      Math.sign(parseInt(s2["jobsApplied"]) - parseInt(s1["jobsApplied"]))
    );
  }
  return { jStudents, dStudents, aStudents };
};
```

Creating a temporary array of three arrays allows me to iterate through that temporary array and use `.sort` to mutate each of those variables.

Another way to do this is as such:

```js
const coachStudents = STUDENTS.reduce(
  (obj, student) => {
    const key = `${student["careerCoach"].toLowerCase()}Students`;
    obj[key].push(student);
  },
  { aStudents: [], jStudents: [], dStudents: [] }
);

for (let coach in coachStudents) {
  let studentArray = coachStudents[coach];
  studentArray.sort((s1, s2) =>
    Math.sign(parseInt(s2["jobsApplied"]) - parseInt(s1["jobsApplied"]))
  );
}
```

This solution leverages the fact that each student has a `careerCoach` key that points to a single letter which is the first letter of the first name of the coach. This allows me to dynamically add the student to the appropriate coach's array of students. After all of the students are added to the respective coach's array, all of the arrays are sorted much like the previous example.

I am not too fond of this second solution because while it is creative and doesn't repeat code like the first solution, I feel like it is not as readable or as intuitive to understand. This would be a better solution if there were a million career coaches, but since there are only three, the three variable declarations in the first solution is much more clear.
