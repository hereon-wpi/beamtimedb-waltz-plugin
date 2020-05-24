/**
 *
 * @author Igor Khokhriakov <igor.khokhriakov@hzg.de>
 * @since 20.11.2019
 */
import filter from "./beamtimes_filter.js";
import {newBeamtimesTreeTable, parseBeamtime} from "./beamtimes_treetable.js";
import {codemirror_textarea, newSearch} from "@waltz-controls/waltz-webix-extensions";
import {kTopicSelectBeamtime, kWidgetBeamtimedb} from "../widget/beamtimedb";


const kBeamtimeDbApiEntryPoint = '/beamtimedb/api/beamtimes';

//TODO prevent global scope
RegExp.prototype.toJSON = function () {
    return {
        $regex: this.source,
        $options: this.flags
    }
};

const kBeamtimesChannel = "beamtimes";

const json_textarea = webix.protoUI({
    name: "json_textarea",
    /**
     *
     * @return {object} non-strict json object
     */
    getValue: function () {
        return eval(`(function(){const q = {${this.editor.getValue()}}; return q;})();`);
    },
    getValueRaw() {
        return this.editor.getValue();
    },
    /**
     *
     * @param {object|any} value
     */
    update(value) {
        if (!value) return;
        this.setValue(JSON.stringify(value));
        const totalLines = this.editor.lineCount();
        this.editor.autoFormatRange({line: 0, ch: 0}, {line: totalLines});
    },
    $init(config) {
        config.mode = "application/json"
    }
}, codemirror_textarea);


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
                config.root.dispatch(beamtime, kTopicSelectBeamtime, kWidgetBeamtimedb);
            }
        }
    };
}

const ajax = webix.ajax;

function promiseBeamtimes() {
    return ajax(kBeamtimeDbApiEntryPoint)
        .then(response => response.json())
}

const beamtimes_list = webix.protoUI(
    {
        name: 'beamtimes_list',
        refresh() {
            promiseBeamtimes()
                .then(ids => {
                    this.$$('list').clearAll();
                    this.$$('list').parse(ids);
                })
        },
        ui(config) {
            return {
                rows: [
                    newSearch("list", filter),
                    newList(config)
                ]
            }
        },
        save() {
            return false;
        },
        /**
         * @constructs
         * @memberof ui.DeviceViewPanel.DevicePanelPipes
         */
        $init: function (config) {
            webix.extend(config, this.ui(config));
            this.$ready.push(() => {
                this.refresh();
            });
        }
    }, webix.ProgressBar, webix.IdSpace, webix.ui.layout
);

function newBeamtimesToolbar() {
    return {
        view: "toolbar",
        cols: [
            {
                maxWidth: 380,
                view: 'text',
                id: 'query_name',
                name: 'query_name',
                placeholder: 'query name',
                label: 'Query name:',
                labelWidth: 100,
                validate: webix.rules.isNotEmpty,
                invalidMessage: "Query name can not be empty",
                on: {
                    /**
                     * Event listener.
                     * @memberof ui.ScriptingConsole.upper_toolbar
                     */
                    onBindApply: function (script) {
                        if (!script || script.id === undefined) {
                            this.setValue(''); //reset this value after script removal
                            return false;
                        }
                        this.setValue(script.id);
                    },
                    /**
                     * Event listener. Work-around [object Object] in this field.
                     * @memberof ui.ScriptingConsole.upper_toolbar
                     */
                    onBindRequest: function () {
                        if (typeof this.data.value === 'object')
                            this.data.value = '';
                    }
                }
            },
            {
                view: "icon",
                icon: 'wxi-check',
                click: function () {
                    this.getTopParentView().save();
                },
                hotkey: 'ctrl+s',
                tooltip: 'Hotkey: ctrl+s'
            },
            {
                view: "icon",
                icon: 'wxi-trash',
                click: function () {
                    this.getTopParentView().remove();
                }
            }
        ]
    }
}

function newBeamtimesQuery() {
    return {
        cols: [
            {
                view: "list",
                id: 'queries_list',
                select: true,
                template(obj) {
                    return `<span class="webix_icon mdi mdi-file-document-outline"></span> ${obj.id}`;
                },
                on: {
                    onAfterSelect: function (id) {
                        this.getTopParentView().$$('query').setValue(this.getItem(id).value);
                    }
                }
            },
            {view: "json_textarea", id: "query", gravity: 2},
            {
                view: "button", type: "icon", icon: "mdi mdi-play", maxWidth: 30, click() {
                    this.getTopParentView().query(this.getTopParentView().$$('query').getValue())
                }
            }
        ]
    }
}

function newBeamtimesBodyUI() {
    return {
        rows: [
            newBeamtimesToolbar(),
            newBeamtimesQuery(),
            {
                view: "resizer"
            },
            newBeamtimesTreeTable()
        ]
    }
}

function promiseBeamtimesBy(query) {
    return ajax().headers({
        "Content-type": "application/json"
    })
        .post(kBeamtimeDbApiEntryPoint, query)
        .then(response => response.json())

}

class UserQuery {
    constructor(id, code) {
        this.id = id;
        this.code = code;
    }
}

const beamtimes_body = webix.protoUI({
    name: 'beamtimes_body',
    save() {
        if (!this.isVisible() || this.$destructed) return;

        if (!this.$$('query_name').validate()) return null;
        const name = this.$$('query_name').getValue().trim();
        const code = this.$$('query').getValueRaw();

        const query = this.$$('queries_list').getItem(name);

        if (query === undefined)
            this.$$('queries_list').add(new UserQuery(name, code));
        else
            this.$$('queries_list').update(name, {
                id: name,
                code
            });
    },
    remove() {
        if (!this.isVisible() || this.$destructed) return;

        if (!this.$$('query_name').validate()) return null;
        const name = this.$$('query_name').getValue().trim();

        const query = this.$$('queries_list').getItem(name);

        if (query !== undefined)
            this.$$('queries_list').remove(name);
    },
    query(query) {
        promiseBeamtimesBy(query)
            .then(beamtimes => {
                this.$$('output').clearAll();
                this.$$('output').parse(beamtimes.flatMap(beamtime => parseBeamtime(JSON.parse(beamtime))))
            })
    },
    $init(config) {
        webix.extend(config, newBeamtimesBodyUI());

        this.$ready.push(() => {
            this.$$('queries_list').data.sync(config.root.queries);
            this.$$('query_name').bind(this.$$('queries_list'));
        })
    }
}, webix.ProgressBar, webix.IdSpace, webix.ui.layout);
