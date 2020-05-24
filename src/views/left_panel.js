import 'views/beamtimes_list';
import 'views/beamtimes_query';

const kBeamtimesListPanelHeader = "<span class='webix_icon mdi mdi-table'></span> Beamtimes";

export default function newLeftPanelUI(root) {
    return {
        view: 'accordionitem',
        header: kBeamtimesListPanelHeader,
        headerAlt: '',
        headerHeight: 0,
        headerHeightAlt: 30,
        width: 300,
        collapsed: true,
        body: {
            view: 'tabview',
            tabbar: {
                height: 16,
                type: 'clean'
            },
            cells: [
                {
                    header: 'list',
                    body: {
                        view: 'beamtimes_list',
                        id: 'beamtimes_list',
                        root
                    }
                },
                {
                    header: 'queries',
                    body: {
                        view: 'beamtimes_query',
                        id: 'beamtimes_query',
                        root
                    }
                }
            ]
        }
    };
}