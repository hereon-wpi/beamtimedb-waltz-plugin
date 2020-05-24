import BeamtimeDbWidget, {kWidgetBeamtimedb} from "widget/beamtimedb";
import {kUserContext, UserContext} from "@waltz-controls/waltz-user-context-plugin";
import {Application, WaltzWidget} from "@waltz-controls/middleware";

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
    .registerWidget(application => new Main(application))
    .registerWidget(application => new BeamtimeDbWidget(application))
    .run()