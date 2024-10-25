export class State {
    active: boolean;
    success: boolean;
    error: boolean;
    errorReasons: Record<string, unknown>;

    constructor() {
        this.neutralState();
    }
    errorState(errorReason?: string | number) {
        this.active = false;
        this.success = false;
        this.error = true;
        if (errorReason) {
            this.errorReasons[errorReason] = true;
        }
    }
    successState() {
        this.active = false;
        this.success = true;
        this.error = false;
        this.errorReasons = {};
    }

    neutralState() {
        this.active = false;
        this.success = false;
        this.error = false;
        this.errorReasons = {};
    }

    activeState() {
        this.active = true;
        this.success = false;
        this.error = false;
        this.errorReasons = {};
    }
}
