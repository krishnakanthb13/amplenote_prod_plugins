/**
 * Generates an analog clock SVG and inserts it as a media image.
 * @param {object} app - The Amplenote app object.
 * @returns {Promise<string>} - Returns an empty string upon success (to prevent double insertion).
 */
export async function analog(app) {
    if (!app.context.noteUUID) return "Error: Open a note to insert image.";

    try {
        const theme = app.settings["timestamp analog - theme"] || "dark";
        const now = new Date();
        const h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
        const hAng = (h % 12) * 30 + m * 0.5, mAng = m * 6 + s * 0.1, sAng = s * 6;
        const themes = {
            dark: { bg: "#1c1c1c", stroke: "#333", hands: "#ccc", sec: "#fff" },
            light: { bg: "#f9f9f9", stroke: "#ccc", hands: "#333", sec: "#333" },
            neon: { bg: "#000", stroke: "#0f0", hands: "#f0f", sec: "#ff0" }
        };
        const t = themes[theme] || themes.dark;

        const size = Math.max(50, Math.min(500, Number(app.settings["timestamp analog - size"]) || 100));

        const ticks = Array.from({ length: 12 }, (_, i) => {
            const angle = (i * 30 - 90) * Math.PI / 180;
            const x1 = 50 + 42 * Math.cos(angle);
            const y1 = 50 + 42 * Math.sin(angle);
            const x2 = 50 + 46 * Math.cos(angle);
            const y2 = 50 + 46 * Math.sin(angle);
            return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${t.stroke}" stroke-width="2"/>`;
        }).join('');

        const svg = `<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">` +
            `<circle cx="50" cy="50" r="48" stroke="${t.stroke}" stroke-width="4" fill="${t.bg}"/>` +
            ticks +
            `<line x1="50" y1="50" x2="50" y2="30" stroke="${t.hands}" stroke-width="5" transform="rotate(${hAng}, 50, 50)"/>` +
            `<line x1="50" y1="50" x2="50" y2="20" stroke="${t.hands}" stroke-width="3" transform="rotate(${mAng}, 50, 50)"/>` +
            `<line x1="50" y1="50" x2="50" y2="10" stroke="${t.sec}" stroke-width="1" transform="rotate(${sAng}, 50, 50)"/>` +
            `<circle cx="50" cy="50" r="3" fill="${t.sec}"/></svg>`;

        const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });

        const dataURL = await new Promise(r => {
            const fr = new FileReader();
            fr.onload = e => r(e.target.result);
            fr.readAsDataURL(blob);
        });

        const pngURL = await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const c = document.createElement('canvas');
                c.width = size; c.height = size;
                c.getContext('2d').drawImage(img, 0, 0, size, size);
                resolve(c.toDataURL('image/png'));
            };
            img.onerror = reject;
            img.src = dataURL;
        });

        const url = await app.attachNoteMedia({ uuid: app.context.noteUUID }, pngURL);

        if (url) {
            const encoded = window.encodeURIComponent(window.btoa(unescape(encodeURIComponent(svg))));
            const post = app.settings["timestamp analog - suffix"] || "";
            const markdown = `![${now.toLocaleTimeString()}](${url}?text=${encoded})${post ? " " + post : ""}.`;

            await app.context.replaceSelection(markdown);
        } else {
            app.alert("Upload Failed");
        }

    } catch (e) {
        app.alert("Error: " + e.message);
    }
    return ""; // CHANGED from null to empty string to stop double-insert
}
