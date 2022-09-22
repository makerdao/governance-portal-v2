export const styles = {
  spinner: {
    color: 'primary',
    strokeWidth: 3,
    size: 4
  },
  donut: {
    color: 'primary',
    strokeWidth: 3,
    size: 6
  },
  root: {
    fontFamily: 'body',
    lineHeight: 'body',
    fontWeight: 'body'
  },
  h1: {
    variant: 'text.largeHeading'
  },
  h2: {
    variant: 'text.mediumHeading'
  },
  h3: {
    variant: 'text.smallHeading'
  },
  h4: {
    variant: 'text.microHeading'
  },
  h5: {
    variant: 'text.heading',
    fontSize: 3,
    py: 2,
    fontWeight: 500
  },
  a: {
    color: 'accentBlue',
    textDecoration: 'none'
  },
  hr: { color: 'secondary' },
  code: {
    overflow: 'auto',
    p: 3,
    bg: 'background',
    fontSize: 3,

    // comments and characters like <, =>, (), etc
    '.comment,.prolog,.doctype,.cdata,.punctuation,.operator,.entity,.url': {
      color: 'secondaryEmphasis'
    },
    '.comment': {
      fontStyle: 'italic'
    },
    // class names, functions and numbers
    '.property, .tag, .boolean, .number, .constant, .symbol, .deleted, .function, .class-name, .maybe-class-name, .regex, .important, .variable':
      {
        color: 'textSecondary'
      },

    // keywords like const, return
    '.atrule, .attr-value, .keyword': {
      color: 'primaryEmphasis'
    },

    // strings
    '.selector, .attr-name, .string, .char, .builtin, .inserted': {
      color: 'primary'
    }
  },

  // applies to single-backticks
  inlineCode: {
    fontFamily: 'monospace',
    fontSize: 3,
    bg: 'primaryMuted',
    color: 'primaryAlt',
    px: 1
  }
};
