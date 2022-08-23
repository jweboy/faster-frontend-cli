import ora, { Ora } from 'ora';

class Loading {
  spinner: Ora;

  constructor() {
    this.spinner = null;
  }

  start(text: string) {
    this.spinner = ora(text).start();
  }

  stop() {
    this.spinner.stop();
  }
}

const loading = new Loading();

export default loading;
