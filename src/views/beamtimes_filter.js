/**
 *
 * @author Igor Khokhriakov <igor.khokhriakov@hzg.de>
 * @since 11.02.2020
 */
//TODO improve - parseBeamtime after loading data in root.beamtimes
export default function filter(obj, value) {
    value = value.toLowerCase();
    if (value.startsWith("a:") ||
        value.startsWith("p:") ||
        value.startsWith("l:") ||
        value.startsWith("i:")) {
        const key = value.substring(0, 2);
        const filter = value.substring(2);

        switch (key) {
            case "a:":
                return obj.applicant.toLowerCase().includes(filter);
            case "p:":
                return obj.pi.toLowerCase().includes(filter);
            case "l:":
                return obj.leader.toLowerCase().includes(filter);
            case "i:":
                return obj.beamtimeId.toLowerCase().includes(filter);
        }
    } else {
        return obj.applicant.toLowerCase().includes(value) ||
            obj.leader.toLowerCase().includes(value) ||
            obj.pi.toLowerCase().includes(value) ||
            obj.beamtimeId.toLowerCase().includes(value)
    }
}