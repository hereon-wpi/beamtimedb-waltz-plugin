/**
 *
 * @author Igor Khokhriakov <igor.khokhriakov@hzg.de>
 * @since 11.02.2020
 */
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
                return obj.applicant_lower.includes(filter);
            case "p:":
                return obj.pi_lower.includes(filter);
            case "l:":
                return obj.leader_lower.includes(filter);
            case "i:":
                return obj.beamtimeId_lower.includes(filter);
        }
    } else {
        return obj.applicant_lower.includes(value) ||
            obj.leader_lower.includes(value) ||
            obj.pi_lower.includes(value) ||
            obj.beamtimeId_lower.includes(value)
    }
}