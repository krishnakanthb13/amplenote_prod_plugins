import { digital } from './lib/formatters/digital.js';
import { roman } from './lib/formatters/roman.js';
import { analog } from './lib/formatters/analog.js';
import { text } from './lib/formatters/text.js';
import { unix } from './lib/formatters/unix.js';
import { unixToDateTime } from './lib/replacers/unix_to_datetime.js';

export default {
    insertText: {
        "Digital": digital,
        "Roman": roman,
        "Analog": analog,
        "Text": text,
        "Unix": unix
    },
    replaceText: {
        "UnixToDateTime": unixToDateTime
    }
}