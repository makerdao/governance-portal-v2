import { render, RenderResult } from '@testing-library/react';
import { ThemeProvider } from 'theme-ui';
import { ethers } from 'ethers';
import WrappedAccountSelect from '../components/header/AccountSelect';
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

export function renderWithAccountSelect(component): RenderResult {
  return render(
    <>
      <ThemeProvider theme={theme}>
        <WrappedAccountSelect />
        {component}
      </ThemeProvider>
    </>
  );
}
