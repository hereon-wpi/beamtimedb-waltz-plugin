import {WaltzWidget} from "@waltz-controls/middleware";

const kWidgetBeamtimedb = 'widget:beamtimedb';


export default class BeamtimeDbWidget extends WaltzWidget {
    constructor(app) {
        super(kWidgetBeamtimedb, app);
    }

    run() {

    }
}