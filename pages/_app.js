import React from 'react';
import App from 'next/app';
import theme from '@makerdao/dai-ui-theme-maker';
import { ThemeProvider } from 'theme-ui';
import MakerProvider from '../providers/MakerProvider';

class MyApp extends App {
  state = {};

  componentDidMount() {
    this.setState({
      network: window.location.search.includes('kovan') ? 'kovan' : 'mainnet',
    });
  }

  render() {
    const { Component, pageProps } = this.props;
    const { network } = this.state;
    return (
      <MakerProvider network={network}>
        <ThemeProvider theme={theme}>
          <Component {...pageProps} />
        </ThemeProvider>
      </MakerProvider>
    );
  }
}

export default MyApp;
