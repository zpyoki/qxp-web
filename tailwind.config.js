const colors = require('./tailwind-config/colors');

module.exports = {
  purge: ['./clients/**/*.tsx'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: colors,
    spacing: {
      0: '0px',
      1: '1px',
      2: '2px',
      4: '4px',
      5: '5px',
      6: '6px',
      7: '7px',
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
      52: '52px',
      56: '56px',
      58: '58px',
      72: '72px',
      96: '96px',
      144: '144px',
    },
    lineHeight: {
      24: '24px',
      28: '28px',
      48: '48px',
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
      full: '50%',
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
      width: {
        24: '24px',
        32: '32px',
        208: '208px',
        214: '214px',
        259: '259px',
        316: '316px',
        588: '588px',
      },
      minWidth: {
        90: '90px',
      },
      maxWidth: {
        '%90': '90%',
      },
      height: {
        24: '24px',
        28: '28px',
        32: '32px',
        56: '56px',
        62: '62px',
        86: '86px',
        160: '160px',
        280: '280px',
      },
      borderWidth: {
        1.5: '1.5px',
      },
      lineHeight: {
        11: '11px',
        25: '25px',
      },
      flex: {
        none: '0 0 0%',
        2: '2 2 0%',
        3: '3 3 0%',
        5: '5 5 0%',
      },
      margin: {
        3.5: '3.5px',
        3: '3px',
      },
      inset: {
        '-2px': '-2px',
        42: '42px',
        64: '64px',
      },
      zIndex: {
        '-z-1': -1,
      },
      cursor: {
        grab: 'grab',
      },
      textColor: {
        inherit: 'inherit',
      },
    },
  },
};
