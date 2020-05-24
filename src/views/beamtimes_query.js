import {codemirror_textarea} from "@waltz-controls/waltz-webix-extensions";
import {ContextEntity} from "widget/beamtimedb";
import {kChannelLog, kTopicError} from "@waltz-controls/waltz-user-context-plugin";


RegExp.prototype.toJSON = function () {
    return {
        $regex: this.source,
        $options: this.flags
    }
};

const json_textarea = webix.protoUI({
    name: "json_textarea",
    /**
     *
     * @return {object} non-strict json object
     */
    getValue: function () {
        try {
            return eval(`(function(){const q = {${this.editor.getValue()}}; return q;})();`);
        } catch (e) {
            this.config.root.dispatchError(e, kTopicError, kChannelLog);
        }
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

function newBeamtimesToolbar(config) {
    return {
        view: "toolbar",
        borderless: true,
        cols: [
            {
                view: "icon",
                icon: 'wxi-trash',
                click: function () {
                    this.getTopParentView().remove();
                }
            },

            {
                maxWidth: 380,
                view: 'text',
                id: 'query_name',
                name: 'query_name',
                placeholder: 'query name',
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
                icon: 'mdi mdi-content-save',
                click: function () {
                    this.getTopParentView().save();
                },
                hotkey: 'ctrl+s',
                tooltip: 'Hotkey: ctrl+s'
            },
            {
                view: "icon", icon: "mdi mdi-play", click() {
                    config.root.query(this.getTopParentView().$$('query').getValue())
                }
            }
        ]
    }
}

export const beamtimes_query = webix.protoUI({
    name: 'beamtimes_query',
    ui(config) {
        return {
            rows: [
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
                {view: "json_textarea", id: "query", gravity: 2, root: config.root},
                newBeamtimesToolbar(config)
            ]
        }
    },
    save() {
        if (!this.isVisible() || this.$destructed) return;

        if (!this.$$('query_name').validate()) return null;
        const id = this.$$('query_name').getValue().trim();
        const value = this.$$('query').getValueRaw();

        const query = this.$$('queries_list').getItem(id);

        //see https://docs.webix.com/desktop__nonui_objects.html
        if (query === undefined)
            this.config.root.queries.add(new ContextEntity({id, value}));
        else
            this.$$('queries_list').updateItem(id, {
                value
            });
    },
    remove() {
        if (!this.isVisible() || this.$destructed) return;

        if (!this.$$('query_name').validate()) return null;
        const id = this.$$('query_name').getValue().trim();

        const query = this.$$('queries_list').getItem(id);

        if (query !== undefined)
            this.config.root.queries.remove(id);
    },
    $init(config) {
        webix.extend(config, this.ui(config))

        this.$ready.push(() => {
            this.$$('queries_list').sync(config.root.queries);
            this.$$('query_name').bind(this.$$('queries_list'));
        })
    }
}, webix.IdSpace, webix.ui.layout);