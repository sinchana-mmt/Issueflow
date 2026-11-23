import { runBackup } from "../src/server/backup";

runBackup()
  .then((result) => {
    console.log(result.sqlPath);
    console.log(result.archivePath);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
