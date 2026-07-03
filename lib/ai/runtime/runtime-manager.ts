import { RuntimeEngine } from "./runtime-engine";
import { RuntimeState } from "./runtime-state";

export class RuntimeManager {

  private readonly runtime =
    new RuntimeEngine();

  private state =
    RuntimeState.IDLE;

  initialize() {

    this.state =
      RuntimeState.READY;

  }

  getState() {

    return this.state;

  }

  engine() {

    return this.runtime;

  }

}
