import { render, RenderResult } from '@testing-library/react';
import { ThemeProvider } from 'theme-ui';
import { Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers';
import theme from '../lib/theme';

export function renderWithTheme(component): RenderResult {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
}

export function injectProvider() {
  (window as any).ethereum = new Proxy (new ethers.providers.JsonRpcProvider('http://localhost:2000'), {
    get(target, key) {
      if (key === 'enable') {
        return async () => ['0x16Fb96a5fa0427Af0C8F7cF1eB4870231c8154B6'];
      }
      if (key === '_state') {
        return {
          accounts: ['0x16Fb96a5fa0427Af0C8F7cF1eB4870231c8154B6']
        }
      }
      // uncomment the following to debug window.ethereum errors
      // if (!target[key]) console.log(key);
      return target[key];
    }
  });
}

// may still be necessary for end-to-end testing
export function renderWithWeb3ReactProvider(component): RenderResult {
  const getLibrary = (provider, connector) => ({ provider, connector });
  return render(
    <Web3ReactProvider getLibrary={getLibrary}>
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    </Web3ReactProvider>
  );
}
