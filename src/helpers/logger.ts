import moment from "moment";

class Logger {
  log(data: any) {
    if (typeof data === "object") {
      data = JSON.stringify(data);
    }

    console.error(moment().toString(), data);
  }
}

export default new Logger();
