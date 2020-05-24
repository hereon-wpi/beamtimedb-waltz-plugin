import {newSearch} from "@waltz-controls/waltz-webix-extensions";
import filter from "./beamtimes_filter";
import {kTopicSelectBeamtime, kWidgetBeamtimedb} from "widget/beamtimedb";

function newList(config) {
    return {
        view: "list",
        id: "list",
        select: true,
        type: {
            height: "auto"
        },
        template(obj) {
            return `<ul>
                    <li>Applicant: ${obj.applicant}</li>
                    <li>Principle Investigator: ${obj.pi}</li>
                    <li>Leader: ${obj.leader}</li>
                    <li>Id: ${obj.beamtimeId}</li>
                    </ul>`;
        },
        scheme: {
            $init(obj) {
                for (const property in obj) {
                    obj[`${property}_lower`] = obj[property].toLowerCase();
                }
            }
        },
        on: {
            onItemClick(id) {
                const beamtime = this.getItem(id);
                const {beamtimeId} = beamtime;
                config.root.dispatch({beamtimeId}, kTopicSelectBeamtime, kWidgetBeamtimedb);
            }
        }
    };
}

const beamtimes_list = webix.protoUI(
    {
        name: 'beamtimes_list',
        ui(config) {
            return {
                rows: [
                    newSearch("list", filter),
                    newList(config)
                ]
            }
        },
        /**
         * @constructs
         * @memberof ui.DeviceViewPanel.DevicePanelPipes
         */
        $init: function (config) {
            webix.extend(config, this.ui(config));

            this.$ready.push(() => {
                this.$$('list').data.sync(config.root.beamtimes);
            });
        }
    }, webix.ProgressBar, webix.IdSpace, webix.ui.layout
);