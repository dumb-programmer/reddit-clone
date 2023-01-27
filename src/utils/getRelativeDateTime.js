import { intlFormatDistance } from "date-fns";

const getRelativeDateTime = (date) => {
    return intlFormatDistance(date, new Date());
};

export default getRelativeDateTime;