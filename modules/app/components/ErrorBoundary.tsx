import React from 'react';
import { toast } from 'react-toastify';
import { Box, Text, Link as ThemeUILink } from 'theme-ui';

export class ErrorBoundary extends React.Component<{ componentName: string }> {
  componentName = 'component';

  constructor(props: { componentName: string }) {
    super(props);
    this.state = { hasError: false };
    this.componentName = props.componentName || this.componentName;
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    toast.error(`Error loading ${this.componentName}`);
  }

  render() {
    if ((this.state as any).hasError) {
      // You can render any custom fallback UI
      return (
        <Box sx={{ variant: 'cards.primary', p: [2] }}>
          <Text>
            There was a problem loading {this.componentName}. Please, reload the application or contact our
            team on{' '}
            <ThemeUILink
              sx={{ color: 'text' }}
              href="https://discord.gg/tQ5wnN6Ms4"
              title="Discord"
              target="_blank"
              rel="noreferrer"
            >
              Discord
            </ThemeUILink>
          </Text>
        </Box>
      );
    }

    return this.props.children;
  }
}
