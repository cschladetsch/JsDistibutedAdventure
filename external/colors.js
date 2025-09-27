/**
 * Simple console color utility module
 * Provides methods for colorizing terminal output
 */

const colors = {
    // Text colors
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',

    // Background colors
    bgBlack: '\x1b[40m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
    bgMagenta: '\x1b[45m',
    bgCyan: '\x1b[46m',
    bgWhite: '\x1b[47m',

    // Text styles
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    underscore: '\x1b[4m',
    blink: '\x1b[5m',
    reverse: '\x1b[7m',
    hidden: '\x1b[8m'
};

class Colors {
    // Color text methods
    static red(text) {
        return `${colors.red}${text}${colors.reset}`;
    }

    static green(text) {
        return `${colors.green}${text}${colors.reset}`;
    }

    static blue(text) {
        return `${colors.blue}${text}${colors.reset}`;
    }

    static yellow(text) {
        return `${colors.yellow}${text}${colors.reset}`;
    }

    static cyan(text) {
        return `${colors.cyan}${text}${colors.reset}`;
    }

    static magenta(text) {
        return `${colors.magenta}${text}${colors.reset}`;
    }

    static white(text) {
        return `${colors.white}${text}${colors.reset}`;
    }

    // Background color methods
    static bgRed(text = ' ') {
        return `${colors.bgRed}${text}${colors.reset}`;
    }

    static bgGreen(text = ' ') {
        return `${colors.bgGreen}${text}${colors.reset}`;
    }

    static bgBlue(text = ' ') {
        return `${colors.bgBlue}${text}${colors.reset}`;
    }

    static bgYellow(text = ' ') {
        return `${colors.bgYellow}${text}${colors.reset}`;
    }

    static bgWhite(text = ' ') {
        return `${colors.bgWhite}${text}${colors.reset}`;
    }

    static bgBlack(text = ' ') {
        return `${colors.bgBlack}${text}${colors.reset}`;
    }

    // Combined styles
    static brightWhiteOnBlack(text) {
        return `${colors.bright}${colors.white}${colors.bgBlack}${text}${colors.reset}`;
    }

    // Raw codes for manual use
    static get codes() {
        return colors;
    }
}

module.exports = Colors;