const colors = require('./tailwind-config/colors');

module.exports = {
  purge: ['./clients/**/*.tsx'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: colors,
    spacing: {
      0: '0px',
      2: '2px',
      4: '4px',
      5: '5px',
      6: '6px',
      8: '8px',
      10: '10px',
      12: '12px',
      16: '16px',
      18: '18px',
      20: '20px',
      22: '22px',
      24: '24px',
      28: '28px',
      32: '32px',
      36: '36px',
      40: '40px',
      44: '44px',
      46: '46px',
      48: '48px',
      56: '56px',
      58: '58px',
      72: '72px',
      144: "144px",
    },
    lineHeight: {
      24: '24px',
      28: '28px',
      48: '48px'
    },
    fontSize: {
      24: ['24px', '32px'],
      20: ['20px', '28px'],
      18: ['18px', '28px'],
      16: ['16px', '24px'],
      14: ['14px', '22px'],
      12: ['12px', '20px'],
    },
    borderRadius: {
      2: '2px',
      4: '4px',
      6: '6px',
      8: '8px',
      10: '10px',
      12: '12px',
      none: '0px',
      // todo remove this
      dot4: '0.4rem',
    },
    // disable responsive
    screens: {
      // '2xl': { max: '1535px' },
      // xl: { max: '1279px' },
      // lg: { max: '1023px' },
      // md: { max: '767px' },
      // sm: { max: '639px' },
    },
    extend: {
      colors: {
        'white-dot-6-5': 'rgba(255, 255, 255, .65)',
      },
      width: {
        '2dot4': '2.4rem',
        588: '588px',
        214: '214px',
        259: '259px'
      },
      minWidth: {
        90: '90px',
      },
      maxWidth: {
        '%90': '90%',
      },
      height: {
        '2dot4': '2.4rem',
        '5.6': '5.6rem',
        160: '160px',
        56: '56px',
      },
      borderWidth: {
        '1.5': '1.5px',
      },
      lineHeight: {
        11: '1.1rem',
        'dot-9': '0.9rem',
      },
      minHeight: {
        'dot-8': '0.8rem',
      },
      flex: {
        none: '0 0 0%',
        2: '2 2 0%',
        3: '3 3 0%',
        5: '5 5 0%',
      },
      margin: {
        dot875: '0.875rem',
        dot4: '0.4rem',
        3.5: '3.5px',
      },
      inset: {
        '-2px': '-2px',
        42: '42px',
        64: '64px',
      },
    },
  },
};
