import "views/beamtimes_list";
import "views/beamtimes_body";
import {WaltzWidget} from "@waltz-controls/middleware";
import {kChannelLog, kTopicError, kUserContext} from "@waltz-controls/waltz-user-context-plugin";
import {kWidgetMain} from "../../index";
import {parseBeamtime} from "../views/beamtimes_treetable";

export const kWidgetBeamtimedb = 'widget:beamtimedb';
export const kTopicSelectBeamtime = 'topic:select.beamtime';

const kBeamtimesBodyHeader = "<span class='webix_icon mdi mdi-table'></span> Beamtimes";
const kBeamtimesListPanelHeader = "<span class='webix_icon mdi mdi-table'></span> Beamtimes";

const kBeamtimeDbApiEntryPoint = '/beamtimedb/api/beamtimes';

export class ContextEntity {
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

        this.beamtimes = new webix.DataCollection({
            url: kBeamtimeDbApiEntryPoint
        });

        this.listen((beamtime) => this.query(beamtime), kTopicSelectBeamtime, this.name);
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

    /**
     *
     * @param query
     */
    query(query) {
        this.$$body.showProgress()
        this.$$body.$$('output').clearAll();

        fetch(kBeamtimeDbApiEntryPoint, {
            method: 'post',
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(query)
        })
            .then(resp => resp.json())
            .then(beamtimes => {
                this.$$body.$$('output').parse(beamtimes.flatMap(beamtime => parseBeamtime(JSON.parse(beamtime))))
            })
            .catch(err => this.dispatchError(err, kTopicError, kChannelLog))
            .finally(() => this.$$body.hideProgress())
    }
}