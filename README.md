## Introduction

After finishing [App Academy](https://www.appacademy.io/), our students start applying for jobs in software engineering. We (career coaches) guide and help our students navigate this process of applying for jobs. Every week we check in with our students and see how many jobs that they applied to the previous week. The process of seeing how many jobs that our students applied to has been rather tedious so I decided to automate it to save time and increase productivity.

### Technologies

- [puppeteer](https://github.com/GoogleChrome/puppeteer/), a headless Chrome node API to automate Chrome
- [nodemailer](https://github.com/nodemailer/nodemailer), to automatically send an email to each career coach with all of the student data

For a deeper dive into both of these technologies, check out my other more in-depth project [here](https://github.com/AndrewJGregory/scrape-mba-results).

### Previous Workflow

1.  Search for student on our internal website
2.  Look at the number after "Weekly Applied: "

Using a random student as an example, here is what the "Weekly Applied: " would look like on their show page:

![student show page](/images/student_show_page.png)

(name and picture are omitted)

"Weekly Applied: " is the running total of jobs that the student has applied to for a given week. However, this number resets every Monday at 9AM. Due to this, the email has to be generated and sent out before Monday at 9AM. This process of searching for a student and then looking at that specific number would have to be repeated for **every** student. Doing this for 30-40 students becomes exceedingly monotonous very quickly, so automating it was the next logical step.

### General Initial Approaches

Armed with my knowledge of puppeteer and nodemailer from my [previous project](https://github.com/AndrewJGregory/scrape-mba-results), I knew what technologies that I had to use from the beginning.

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

for (const coach in coachStudents) {
  const studentArray = coachStudents[coach];
  studentArray.sort((s1, s2) =>
    Math.sign(parseInt(s2["jobsApplied"]) - parseInt(s1["jobsApplied"])),
  );
}
```

This solution leverages the fact that each student has a `careerCoach` key that points to a single letter which is the first letter of the first name of the coach. This allows me to dynamically add the student to the appropriate coach's array of students. After all of the students are added to the respective coach's array, all of the arrays are sorted much like the previous example.

I am not too fond of this second solution because while it is creative and doesn't repeat code like the first solution, I feel like it is not as readable or as intuitive to understand. This would be a better solution if there were a million career coaches, but since there are only three, the three variable declarations in the first solution is much more clear.
