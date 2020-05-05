import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import useMaker from '../hooks/useMaker';

const Index = () => {
  const { maker } = useMaker();
  const [web3Connected, setWeb3Connected] = useState(false);

  async function connectBrowserWallet() {
    try {
      if (maker) {
        await maker.authenticate();
        setWeb3Connected(true);
      }
    } catch (err) {
      window.alert(err);
    }
  }

  return (
    <div className="wrap">
      <Head>
        <title>Governance Portal V2</title>
      </Head>

      <h1>Governance Portal V2</h1>
      <Link href="/executive">
        <a>to executive proposals</a>
      </Link>
      {!maker ? (
        <div>
          <h3>Loading...</h3>
        </div>
      ) : !web3Connected ? (
        <button onClick={connectBrowserWallet}>Connect Wallet</button>
      ) : (
        <div>
          <h3>Connected Account</h3>
          <p>{maker.currentAddress()}</p>
        </div>
      )}
    </div>
  );
};

export default Index;
