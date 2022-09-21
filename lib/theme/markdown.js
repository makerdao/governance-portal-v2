export const markdown = {
  default: {
    wordBreak: 'break-word',
    h1: {
      color: 'text',
      fontSize: [5, 6],
      fontWeight: 500
    },
    h2: {
      color: 'text',
      fontSize: [4, 5],
      fontWeight: 500,
      mb: 0
    },
    h3: {
      color: 'text',
      fontSize: [3, 4],
      fontWeight: 500
    },
    p: {
      color: 'textSecondary',
      fontSize: [2, 3],
      my: 2
    },
    li: {
      fontSize: [2, 3],
      color: 'textSecondary'
    },
    a: {
      color: 'accentBlue',
      textDecoration: 'none',
      ':hover': { color: 'accentBlueEmphasis' }
    },
    '& > :first-of-type': {
      mt: 0
    },
    table: {
      borderSpacing: 0,
      borderCollapse: 'collapse',
      display: 'block',
      width: '100%',
      overflow: 'auto'
    },
    th: {
      fontWeight: 600,
      padding: '6px 13px',
      border: theme => `1px solid ${theme.colors.secondary}`
    },
    td: {
      padding: '6px 13px',
      border: theme => `1px solid ${theme.colors.secondary}`
    },

    tr: {
      backgroundColor: 'surface',
      borderTop: theme => `1px solid ${theme.colors.secondary}`,
      ':nth-of-type(2n)': {
        backgroundColor: 'background'
      }
    },
    'pre > code': {
      whiteSpace: 'pre-wrap'
    }
  }
};
