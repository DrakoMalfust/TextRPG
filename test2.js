console.clear();

const loadingScreen = `
╔════════════════════════════════════════════════════════════════════════════╗
║                               .-========-.                               ║
║                               \\'-======-'/                               ║
║                               _|  (..)  |_                               ║
║                              ((|   ██   |))                              ║
║                               \\|  ____  |/                               ║
║                                '------'                                  ║
║                                                                           ║
║                       LEGEND OF ERETRIUM                                 ║
║                                                                           ║
║                    Loading world...                                      ║
╚════════════════════════════════════════════════════════════════════════════╝
`;

const menuScreen = `
╔══════════════════════════════════════════════════════════════════════╗
║                              .-====-.                              ║
║                             / (..)  \\\\                             ║
║                             |  ██   |                              ║
║                              \\\\_____/                              ║
║                                                                      ║
║                     LEGEND OF ERETRIUM                               ║
║                                                                      ║
║                        > NEW GAME <                                  ║
║                          CONTINUE                                    ║
║                          LOAD GAME                                   ║
║                           SETTINGS                                   ║
║                            CREDITS                                   ║
║                              EXIT                                    ║
╚══════════════════════════════════════════════════════════════════════╝
`;

const frames = [
"[░░░░░░░░░░░░░░░░░░]",
"[██░░░░░░░░░░░░░░░░]",
"[████░░░░░░░░░░░░░░]",
"[██████░░░░░░░░░░░░]",
"[████████░░░░░░░░░░]",
"[██████████░░░░░░░░]",
"[████████████░░░░░░]",
"[██████████████░░░░]",
"[████████████████░░]",
"[██████████████████]"
];

console.log(loadingScreen);

let i = 0;

const interval = setInterval(() => {
  process.stdout.write("\\rLoading " + frames[i]);

  i++;

  if (i >= frames.length) {
    clearInterval(interval);

    setTimeout(() => {
      console.clear();

      let index = 0;

      const printer = setInterval(() => {
        process.stdout.write(menuScreen[index]);
        index++;

        if (index >= menuScreen.length) {
          clearInterval(printer);
        }
      }, 2);
    }, 500);
  }
}, 200);
