const nodemailer = require("nodemailer");
const { CREDS } = require("./creds");

const currentDate = new Date()
  .toJSON()
  .slice(0, 10)
  .replace(/-/g, "/");

const sendEmail = (students, transporter) => {
  const { jStudents, dStudents, aStudents } = sortStudents(students);
  const joeyTable = makeTable(jStudents, "Joey");
  const dannyTable = makeTable(dStudents, "Danny");
  const andrewTable = makeTable(aStudents, "Andrew");

  const mailOptions = {
    from: `${CREDS["email"]["address"]}`,
    to: `${
      CREDS["email"]["address"]
    }, dcatalano@appacademy.io, jfehrman@appacademy.io`,
    subject: `Job Seeker Report for ${currentDate}`,
    html: `${joeyTable}<br></br>${dannyTable}<br></br>${andrewTable}`
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) console.log(err);
    else console.log(info);
  });
};

const makeTable = (students, careerCoach) => {
  let rows = "";
  students.forEach(student => {
    let row = "<tr>";
    const nameCell = `<td>${student["name"]}</td>`;
    const jobsAppliedCell = `<td>${student["jobsApplied"]}</td>`;
    row = row.concat(`${nameCell}${jobsAppliedCell}`);
    rows = rows.concat(row).concat("</tr>");
  });

  return `<table style='text-align: center'>
  <thead>
  <tr>
  <th colspan='2'>${careerCoach}'s Job Seeker Report for ${currentDate}</th>
  </tr></thead><tbody style='text-align: center'>
  <tr>
  <td>Name</td>
  <td>Weekly Jobs Applied</td>
  </tr>
  ${rows}
  </tbody>
</table>`;
};

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

const openEmailConnection = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: `${CREDS["email"]["address"]}`,
      pass: `${CREDS["email"]["password"]}`
    }
  });
};

module.exports = { sendEmail, openEmailConnection };
