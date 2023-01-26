const fs = require("fs");
const { exec } = require("child_process")

let fileData = fs.readFileSync("./prisma/schema.prisma", "utf-8")
let data = fileData.split("\n");

data.map((l) => {
  if (l.trim().startsWith("url")) {
    let index = data.indexOf(l);
    if(l.split('"')[1] == "PROD_DATABASE_URL") {
      data[index] = 'url = env("DATABASE_URL")';
    } else {
      data[index] = 'url = env("PROD_DATABASE_URL")';
    }
  }
});

fs.writeFileSync("./prisma/schema.prisma", data.join("\n"), { encoding: "utf-8" });
exec("pnpx prisma format")