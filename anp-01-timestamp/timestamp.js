/**
 * @file timestamp.js
 * @description Main entry point for the Timestamp Plugin. Provides various timestamp insertion formats and utility replacements.
 * @author Krishna Kanth B
 */
import { digital } from './lib/formatters/digital.js';
import { roman } from './lib/formatters/roman.js';
import { analog } from './lib/formatters/analog.js';
import { text } from './lib/formatters/text.js';
import { unix } from './lib/formatters/unix.js';
import { unixToDateTime } from './lib/replacers/unix_to_datetime.js';

/**
 * The main plugin export conforming to the Amplenote Plugin API.
 * @type {object}
 * @property {object} insertText - Methods for inserting various timestamp formats.
 * @property {object} replaceText - Methods for transforming selected text (Unix to Local).
 */
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