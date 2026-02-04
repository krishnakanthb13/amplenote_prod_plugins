export async function analog(app) {
    if (!app.context.noteUUID) return "Error: Open a note to insert image.";

    try {
        const theme = app.settings["timestamp analog - theme - dark / light / neon"] || "dark";
        const now = new Date();
        const h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
        const hAng = (h % 12) * 30 + m * 0.5, mAng = m * 6 + s * 0.1, sAng = s * 6;
        const themes = {
            dark: { bg: "#1c1c1c", stroke: "#333", hands: "#ccc", sec: "#fff" },
            light: { bg: "#f9f9f9", stroke: "#ccc", hands: "#333", sec: "#333" },
            neon: { bg: "#000", stroke: "#0f0", hands: "#f0f", sec: "#ff0" }
        };
        const t = themes[theme] || themes.dark;

        const svg = `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">` +
            `<circle cx="50" cy="50" r="48" stroke="${t.stroke}" stroke-width="4" fill="${t.bg}"/>` +
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
                c.width = 100; c.height = 100;
                c.getContext('2d').drawImage(img, 0, 0);
                resolve(c.toDataURL('image/png'));
            };
            img.onerror = reject;
            img.src = dataURL;
        });

        const url = await app.attachNoteMedia({ uuid: app.context.noteUUID }, pngURL);

        if (url) {
            const encoded = window.encodeURIComponent(window.btoa(svg));
            const post = app.settings["timestamp analog - post script"] || "";
            const markdown = `![${now.toLocaleTimeString()}](${url}?text=${encoded})${post ? " " + post : ""}.`;

            // Explicit insertion at end of note.
            // Returning "" (empty string) instead of null to prevent auto-insertion.
            await app.insertNoteContent({ uuid: app.context.noteUUID }, markdown, { atEnd: true });
            // app.context.replaceSelection(`![${now.toLocaleTimeString()}](${markdown})`);
        } else {
            app.alert("Upload Failed");
        }

    } catch (e) {
        app.alert("Error: " + e.message);
    }
    return ""; // CHANGED from null to empty string to stop double-insert
}
