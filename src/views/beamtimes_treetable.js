/**
 *
 * @author Igor Khokhriakov <igor.khokhriakov@hzg.de>
 * @since 11.02.2020
 */
export function parseBeamtime(beamtime, id = beamtime.id) {
    return Object.keys(beamtime).map(key => {
        if (beamtime[key] === null || beamtime[key] === undefined) {
            return {
                id: `${id}.${key}`,
                key,
                value: undefined
            }
        }
        if (typeof beamtime[key] == "object") {
            return {
                id: `${id}.${key}`,
                key,
                data: parseBeamtime(beamtime[key], `${id}.${key}`)
            }
        } else {
            return {
                id: `${id}.${key}`,
                key,
                value: beamtime[key]
            };
        }
    });
}

export function newBeamtimesTreeTable() {
    return {
        view: "treetable",
        id: "output",
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
