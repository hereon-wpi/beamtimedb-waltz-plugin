import "views/index";
import {WaltzWidget} from "@waltz-controls/middleware";
import {kUserContext} from "@waltz-controls/waltz-user-context-plugin";
import {kWidgetMain} from "../../index";

export const kWidgetBeamtimedb = 'widget:beamtimedb';
export const kTopicSelectBeamtime = 'topic:select.beamtime';

const kBeamtimesBodyHeader = "<span class='webix_icon mdi mdi-table'></span> Beamtimes";
const kBeamtimesListPanelHeader = "<span class='webix_icon mdi mdi-table'></span> Beamtimes";

class ContextEntity {
    constructor({id, value}) {
        this.id = id;
        this.value = value;
    }
}

export default class BeamtimeDbWidget extends WaltzWidget {
    constructor(app) {
        super(kWidgetBeamtimedb, app);

        const queriesProxy = {
            $proxy: true,
            load: () => {
                return this.getUserContext()
                    .then(userContext =>
                        userContext.getOrDefault(this.name, []).map(contextEntity => new ContextEntity(contextEntity)))
            },
            save: () => {

            }
        }

        this.queries = new webix.DataCollection({
            url: queriesProxy
        });

        this.listen(ev => {
            debugger
            if (this.$$panel.getChildViews()[0] === this.getParentView() &&
                !this.$$panel.getChildViews()[0].config.collapsed)
                $$('beamtimes_list').refresh();
        }, 'refresh', this.name);

        this.listen((beamtime) => {
            this.$$body.query(beamtime)
        }, kTopicSelectBeamtime, this.name);
    }

    getUserContext() {
        return this.app.getContext(kUserContext);
    }

    ui() {
        return {
            header: kBeamtimesBodyHeader,
            borderless: true,
            body: {
                view: 'beamtimes_body',
                id: this.name,
                root: this
            }
        };
    }

    leftPanel() {
        return {
            view: 'accordionitem',
            header: kBeamtimesListPanelHeader,
            width: 300,
            body: {
                view: 'beamtimes_list',
                id: 'beamtimes_list',
                root: this
            }
        };
    }

    run() {
        this.$$panel = this.$$panel || $$(this.app.getWidget(kWidgetMain).leftPanel.addView(this.leftPanel()));


        this.$$body = this.$$body || $$(this.app.getWidget(kWidgetMain).mainView.addView(this.ui()));
    }
}