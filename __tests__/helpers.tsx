import { render, RenderResult } from '@testing-library/react';
import { ThemeProvider } from 'theme-ui';
import { useWeb3React, Web3ReactProvider } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import { getLibrary } from '../lib/maker/web3react';
import theme from '../lib/theme';

export function renderWithTheme(component): RenderResult {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
}

export function renderWithConnectedAccount(component): RenderResult {
  const ganacheConnector = new InjectedConnector({ supportedChainIds: [999] });
  // const { activate } = useWeb3React();
  // activate(ganacheConnector);

  return render(
    <Web3ReactProvider getLibrary={getLibrary}>
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    </Web3ReactProvider>
  );
}
