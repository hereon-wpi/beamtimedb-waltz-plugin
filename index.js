import {BeamtimeDbWidget, kWidgetBeamtimedb} from "widget/beamtimedb";
import {kChannelLog, kTopicError, kUserContext, UserContext} from "@waltz-controls/waltz-user-context-plugin";
import {Application, Controller, WaltzWidget} from "@waltz-controls/middleware";

export const kWidgetMain = 'widget:main';

const dummyUserContext = new UserContext({
    ext: {
        [kWidgetBeamtimedb]: [
            {
                id: 'test',
                value: 'my query'
            }
        ]
    }
});

class Main extends WaltzWidget {
    constructor(app) {
        super(kWidgetMain, app);
    }

    get leftPanel() {
        return $$('left');
    }

    get mainView() {
        return $$('main');
    }

    run() {
        webix.ui({
            cols: [
                {
                    view: 'accordion',
                    id: 'left',
                    rows: []
                },
                {
                    gravity: 6,
                    id: 'main',
                    view: 'tabview',
                    cells: [{}]
                }
            ]
        })
    }
}

const app = new Application({name: APPNAME, version: VERSION})
    .registerContext(kUserContext, dummyUserContext)
    .registerController(application => new class extends Controller {
        constructor() {
            super('log', application);

            this.listen(event => console.error(event), kTopicError, kChannelLog)
        }
    })
    .registerWidget(application => new Main(application))
    .registerWidget(application => new BeamtimeDbWidget(application))
    .run()