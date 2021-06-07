function newBeamtimesTreeTable() {
    return {
        view: "treetable",
        id: "output",
        drag: true,
        dragscroll: true,
        columns: [
            {
                id: "key",
                width: 250,
                header: {content: "textFilter"},
                template: "{common.treetable()} #key#"
            },
            {
                id: "value",
                fillspace: true,
                header: {content: "textFilter"}
            }
        ]
    }
}

const beamtimes_body = webix.protoUI({
    name: 'beamtimes_body',

    ui() {
        return {
            rows: [
                newBeamtimesTreeTable()
            ]
        }
    },
    $init(config) {
        webix.extend(config, this.ui());


    }
}, webix.ProgressBar, webix.IdSpace, webix.ui.layout);