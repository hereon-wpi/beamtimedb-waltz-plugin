import {ContextEntity} from "../widget/beamtimedb";
import {newBeamtimesTreeTable} from "./beamtimes_treetable";
import {codemirror_textarea} from "@waltz-controls/waltz-webix-extensions";


RegExp.prototype.toJSON = function () {
    return {
        $regex: this.source,
        $options: this.flags
    }
};

const ajax = webix.ajax;

function promiseBeamtimes() {
    return ajax(kBeamtimeDbApiEntryPoint)
        .then(response => response.json())
}

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


const beamtimes_body = webix.protoUI({
    name: 'beamtimes_body',
    save() {
        if (!this.isVisible() || this.$destructed) return;

        if (!this.$$('query_name').validate()) return null;
        const id = this.$$('query_name').getValue().trim();
        const value = this.$$('query').getValueRaw();

        const query = this.$$('queries_list').getItem(name);

        if (query === undefined)
            this.$$('queries_list').add(new ContextEntity({id, value}));
        else
            this.$$('queries_list').update(id, {
                value
            });
    },
    remove() {
        if (!this.isVisible() || this.$destructed) return;

        if (!this.$$('query_name').validate()) return null;
        const id = this.$$('query_name').getValue().trim();

        const query = this.$$('queries_list').getItem(id);

        if (query !== undefined)
            this.$$('queries_list').remove(id);
    },

    $init(config) {
        webix.extend(config, newBeamtimesBodyUI());

        this.$ready.push(() => {
            this.$$('queries_list').data.sync(config.root.queries);
            this.$$('query_name').bind(this.$$('queries_list'));
        })
    }
}, webix.ProgressBar, webix.IdSpace, webix.ui.layout);